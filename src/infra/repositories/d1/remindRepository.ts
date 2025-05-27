import type { Remind } from "@/domain/entities/remind";
import { reminds, remindMember } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { IRemindRepository } from "@/domain/repositories/reminds";
import { newSchedule } from "@/domain/entities/schedule";
import { inject, injectable } from "inversify";
import { TOKENS } from "@/tokens";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "@/db/schema";

@injectable()
export class RemindRepository implements IRemindRepository {
  @inject(TOKENS.D1_DATABASE)
  public readonly db!: DrizzleD1Database<typeof schema>;

  async findById(id: string): Promise<Remind | undefined> {
    const res = await this.db.query.reminds.findFirst({
      where: (reminds, { eq }) => eq(reminds.id, id),
      with: {
        remindMembers: {
          with: {
            member: {},
          },
        },
        schedule: {},
      },
    });

    if (!res) {
      return undefined;
    }

    // NOTE: remindMembersを除く
    const formattedRes: Remind = {
      id: res.id,
      scheduleId: res.scheduleId,
      text: res.text,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt,
      deletedAt: res.deletedAt,
      schedule: newSchedule({
        ...res.schedule,
      }),
      members: res.remindMembers?.map((remindMember) => {
        return {
          ...remindMember.member,
        };
      }),
    };

    return formattedRes;
  }

  async findByIds(ids: string[]): Promise<Remind[]> {
    const res = await this.db.query.reminds.findMany({
      where: (reminds, { and, isNull, inArray }) =>
        and(inArray(reminds.id, ids), isNull(reminds.deletedAt)),
      with: {
        remindMembers: {
          with: {
            member: {},
          },
        },
        schedule: {},
      },
    });

    const formattedRes: Remind[] = res.map((remind) => {
      return {
        ...remind,
        schedule: newSchedule({
          ...remind.schedule,
        }),
        members: remind.remindMembers?.map((remindMember) => {
          return {
            ...remindMember.member,
          };
        }),
      };
    });

    return formattedRes;
  }

  /**
   * リマインドデータをDBに挿入するメソッド
   */
  async insert(
    params: {
      data: Omit<Remind, "createdAt" | "updatedAt" | "deletedAt">;
      memberIds?: string[];
    }[],
  ): Promise<void> {
    const formattedData = params.map((param) => {
      const { data, memberIds } = param;
      return {
        data: {
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
        memberIds: memberIds || [],
      };
    });

    await this.db
      .insert(reminds)
      .values(formattedData.map((d) => d.data))
      .execute();

    // NOTE: ユーザーとリマインドを紐づけ
    for (const param of formattedData) {
      if (param.memberIds.length > 0) {
        const formattedRemindMember = param.memberIds.map((memberId) => ({
          memberId,
          remindId: param.data.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        await this.db
          .insert(remindMember)
          .values(formattedRemindMember)
          .execute();
      }
    }
  }

  async delete(id: string): Promise<void> {
    await this.db
      .update(reminds)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(reminds.id, id))
      .execute();

    // NOTE: 中間テーブルの削除
    await this.db
      .delete(remindMember)
      .where(eq(remindMember.remindId, id))
      .execute();
  }
}
