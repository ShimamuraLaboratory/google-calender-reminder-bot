import type { Remind } from "@/domain/entities/remind";
import { reminds, remindMember } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
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
      sendedAt: res.sendedAt,
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

  async insert(
    data: Omit<Remind, "createdAt" | "updatedAt" | "deletedAt">,
    memberIds?: string[],
  ): Promise<void> {
    const formattedData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await this.db.insert(reminds).values(formattedData).execute();

    // NOTE: ユーザーとリマインドを紐づけ
    if (memberIds) {
      const formattedRemindMember = memberIds.map((memberId) => ({
        memberId,
        remindId: formattedData.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      await this.db
        .insert(remindMember)
        .values(formattedRemindMember)
        .execute();
    }
  }
  async update(
    id: string,
    data: Omit<Remind, "createdAt" | "updatedAt" | "deletedAt">,
    newMemberIds?: string[],
  ): Promise<void> {
    await this.db.update(reminds).set(data).where(eq(reminds.id, id)).execute();

    // NOTE: リレーションの更新
    if (newMemberIds) {
      const oldRemindMembers = await this.db.query.remindMember.findMany({
        where: (remindMember, { eq }) => eq(remindMember.remindId, id),
      });
      const oldMemberIds = oldRemindMembers.map(
        (remindMember) => remindMember.memberId,
      );
      const newMemberIdsSet = new Set(newMemberIds);
      const oldMemberIdsSet = new Set(oldMemberIds);
      const toInsert = newMemberIds.filter(
        (memberId) => !oldMemberIdsSet.has(memberId),
      );
      const toDelete = oldMemberIds.filter(
        (memberId) => !newMemberIdsSet.has(memberId),
      );
      const formattedRemindMember = toInsert.map((memberId) => ({
        memberId,
        remindId: id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      if (formattedRemindMember.length > 0) {
        await this.db
          .insert(remindMember)
          .values(formattedRemindMember)
          .execute();
      }
      if (toDelete.length > 0) {
        await this.db
          .delete(remindMember)
          .where(
            and(
              eq(remindMember.remindId, id),
              inArray(remindMember.memberId, toDelete),
            ),
          )
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
