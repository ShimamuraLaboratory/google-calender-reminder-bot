import BaseRepository from "./baseRepository";
import type { Member } from "./type";
import { members, roleMember, scheduleMember, remindMember } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export interface IMemberRepository {
  findAll(): Promise<Member[]>;
  findById(id: string): Promise<Member | undefined>;
  findByIds(ids: string[]): Promise<Member[]>;
  findByRoles(roleId: string[]): Promise<Member[]>;
  insert(data: {
    memberId: string;
    userName: string;
    nickName?: string | null;
    roles?: string[];
  }): Promise<void>;
  bulkInsert(
    data: {
      memberId: string;
      userName: string;
      nickName?: string | null;
      roles?: string[];
    }[],
  ): Promise<void>;
  update(data: {
    memberId: string;
    userName: string;
    nickName?: string | null;
    roles?: string[];
  }): Promise<void>;
  bulkUpdate(
    data: {
      memberId: string;
      userName: string;
      nickName?: string | null;
      roles?: string[];
    }[],
  ): Promise<void>;
  delete(id: string[]): Promise<void>;
}

export class MemberRepository
  extends BaseRepository
  implements IMemberRepository
{
  async findAll(): Promise<Member[]> {
    const res = await this.db.query.members.findMany({
      where: (members, { isNull }) => isNull(members.deletedAt),
      with: {
        roleMembers: {
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

  /**
   * メンバーをDBに挿入する
   *
   * @param data
   */
  async insert(data: {
    memberId: string;
    userName: string;
    nickName?: string | null;
    roles?: string[];
  }): Promise<void> {
    const formattedData = {
      memberId: data.memberId,
      userName: data.userName,
      nickName: data.nickName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await this.db.insert(members).values(formattedData).execute();

    // NOTE: roleIdが指定されている場合はroleMemberテーブルにも挿入->roleとのリレーション構築
    if (data.roles) {
      const roleMemberData = data.roles.map((roleId) => ({
        roleId,
        memberId: data.memberId,
        nickName: data.nickName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      await this.db.insert(roleMember).values(roleMemberData).execute();
    }
  }

  /**
   * 複数のメンバーをDBに挿入する
   *
   * @param data
   */
  async bulkInsert(
    data: {
      memberId: string;
      userName: string;
      nickName?: string | null;
      roles?: string[];
    }[],
  ): Promise<void> {
    const formattedData = data.map((member) => ({
      memberId: member.memberId,
      userName: member.userName,
      nickName: member.nickName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    }));

    await this.db.insert(members).values(formattedData).execute();

    // NOTE: roleIdが指定されている場合はroleMemberテーブルにも挿入->roleとのリレーション構築
    const roleMemberData = data
      .map((member) => {
        if (member.roles) {
          return member.roles.map((roleId) => ({
            roleId,
            memberId: member.memberId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }
      })
      .filter((member) => member !== undefined) as {
      roleId: string;
      memberId: string;
      createdAt: string;
      updatedAt: string;
    }[][];

    const flattenedRoleMemberData = roleMemberData.flat();
    if (flattenedRoleMemberData.length > 0) {
      await this.db
        .insert(roleMember)
        .values(flattenedRoleMemberData)
        .execute();
    }
  }

  /**
   * メンバーデータの更新
   *
   * @param data
   */
  async update(data: {
    memberId: string;
    userName: string;
    nickName?: string | null;
    roles?: string[];
  }): Promise<void> {
    await this.db
      .update(members)
      .set(data)
      .where(eq(members.memberId, data.memberId))
      .execute();

    // NOTE: 中間テーブルの更新
    if (data.roles) {
      await this.db
        .delete(roleMember)
        .where(eq(roleMember.memberId, data.memberId))
        .execute();
      const roleMemberData = data.roles.map((roleId) => ({
        roleId,
        memberId: data.memberId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      await this.db.insert(roleMember).values(roleMemberData).execute();
    }
  }

  /**
   * 複数のメンバーデータの更新
   * TODO: n+1問題が発生しているので時間がある時修正
   *
   * @param data
   */
  async bulkUpdate(
    data: { memberId: string; userName: string; roles?: string[] }[],
  ): Promise<void> {
    const memberIds = data.map((member) => member.memberId);

    const formattedData = data.map((member) => ({
      userName: member.userName,
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    }));

    await formattedData.forEach(async (member, index) => {
      await this.db
        .update(members)
        .set(member)
        .where(eq(members.memberId, memberIds[index]))
        .execute();
    });

    // NOTE: 中間テーブルの更新
    for (const member of data) {
      if (member.roles) {
        await this.db
          .delete(roleMember)
          .where(eq(roleMember.memberId, member.memberId))
          .execute();
        if (member.roles.length > 0) {
          const roleMemberData = member.roles.map((roleId) => ({
            roleId,
            memberId: member.memberId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          await this.db.insert(roleMember).values(roleMemberData).execute();
        }
      }
    }
  }

  async delete(ids: string[]): Promise<void> {
    // NOTE: 論理削除
    await this.db
      .update(members)
      .set({ deletedAt: new Date().toISOString() })
      .where(inArray(members.memberId, ids))
      .execute();

    // NOTE: 中間テーブルも削除
    await this.db
      .delete(roleMember)
      .where(inArray(roleMember.memberId, ids))
      .execute();

    await this.db
      .delete(scheduleMember)
      .where(inArray(scheduleMember.memberId, ids))
      .execute();

    await this.db
      .delete(remindMember)
      .where(inArray(remindMember.memberId, ids))
      .execute();
  }
}
