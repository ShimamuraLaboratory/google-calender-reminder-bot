import BaseRepository from "./baseRepository";
import type { Member } from "./type";
import { members, roleMember, scheduleMember, remindMember } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export interface IMemberRepository {
  findById(id: string): Promise<Member | undefined>;
  findByIds(ids: string[]): Promise<Member[]>;
  findByRoles(roleId: string[]): Promise<Member[]>;
  insert(
    data: Omit<Member, "createdAt" | "updatedAt" | "deletedAt">,
    roleIds?: string[],
  ): Promise<void>;
  update(
    id: string,
    data: Omit<Member, "createdAt" | "updatedAt" | "deletedAt">,
    newRoleIds?: string[],
  ): Promise<void>;
  delete(id: string): Promise<void>;
}

export class MemberRepository
  extends BaseRepository
  implements IMemberRepository
{
  async findById(id: string): Promise<Member | undefined> {
    const res = await this.db.query.members.findFirst({
      where: (members, { eq }) => eq(members.memberId, id),
      with: {
        roleMembers: {
          with: {
            role: {},
          },
        },
      },
    });
    return res;
  }

  async findByIds(ids: string[]): Promise<Member[]> {
    const res = await this.db.query.members.findMany({
      where: (members, { and, isNull, inArray }) =>
        and(inArray(members.memberId, ids), isNull(members.deletedAt)),
      with: {
        roleMembers: {
          with: {
            role: {},
          },
        },
      },
    });
    return res;
  }

  async findByRoles(roleIds: string[]): Promise<Member[]> {
    const res = await this.db.query.members.findMany({
      where: (members, { isNull }) => isNull(members.deletedAt),
      with: {
        roleMembers: {
          where: (roleMembers, { inArray }) =>
            inArray(roleMembers.roleId, roleIds),
          with: {
            role: {},
          },
        },
      },
    });

    const formattedRes = res.map((member) => {
      const { roleMembers, ...rest } = member;
      return {
        ...rest,
        roles: roleMembers.map((roleMember) => roleMember.role),
      };
    });

    return formattedRes;
  }

  // NOTE: roleIdを引数に持たせることでロールを指定する挿入も可能
  async insert(
    data: Omit<Member, "createdAt" | "updatedAt" | "deletedAt">,
    roleIds?: string[],
  ): Promise<void> {
    const formattedData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await this.db.insert(members).values(formattedData).execute();

    // NOTE: roleIdが指定されている場合はroleMemberテーブルにも挿入->roleとのリレーション構築
    if (roleIds) {
      const datas = roleIds.map((roleId) => ({
        roleId,
        memberId: data.memberId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      await this.db.insert(roleMember).values(datas).execute();
    }
  }

  async update(
    id: string,
    data: Omit<Member, "createdAt" | "updatedAt" | "deletedAt">,
    newRoleIds?: string[],
  ): Promise<void> {
    await this.db
      .update(members)
      .set(data)
      .where(eq(members.memberId, id))
      .execute();

    if (newRoleIds) {
      const oldRoles = await this.db.query.roleMember.findMany({
        where: (roleMember, { eq }) => eq(roleMember.memberId, id),
      });

      const oldRoleIds = oldRoles.map((role) => role.roleId);
      const newRoleIdsSet = new Set(newRoleIds);
      const oldRoleIdsSet = new Set(oldRoleIds);
      const roleIdsToAdd = newRoleIds.filter(
        (roleId) => !oldRoleIdsSet.has(roleId),
      );
      const roleIdsToDelete = oldRoleIds.filter(
        (roleId) => !newRoleIdsSet.has(roleId),
      );

      const datasToAdd = roleIdsToAdd.map((roleId) => ({
        roleId,
        memberId: id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // NOTE: 中間テーブルの更新
      if (datasToAdd.length > 0) {
        await this.db.insert(roleMember).values(datasToAdd).execute();
      }
      if (roleIdsToDelete.length > 0) {
        await this.db
          .delete(roleMember)
          .where(
            and(
              eq(roleMember.memberId, id),
              inArray(roleMember.roleId, roleIdsToDelete),
            ),
          )
          .execute();
      }
    }
  }

  async delete(id: string): Promise<void> {
    // NOTE: 論理削除
    await this.db
      .update(members)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(members.memberId, id))
      .execute();

    // NOTE: 中間テーブルも削除
    await this.db
      .delete(roleMember)
      .where(eq(roleMember.memberId, id))
      .execute();

    await this.db
      .delete(scheduleMember)
      .where(eq(scheduleMember.memberId, id))
      .execute();

    await this.db
      .delete(remindMember)
      .where(eq(remindMember.memberId, id))
      .execute();
  }
}
