import type { IDiscordClient } from "@/domain/repositories/discord";
import type { IMemberRepository } from "@/domain/repositories/members";
import type { IRoleRepository } from "@/domain/repositories/roles";

export interface IFetchServerInfoService {
  fetchMembers(guildId: string): Promise<void>;
  fetchRoles(guildId: string): Promise<void>;
}

export class FetchServerInfoService implements IFetchServerInfoService {
  private discordClient: IDiscordClient;
  private memberRepository: IMemberRepository;
  private roleRepository: IRoleRepository;

  constructor(
    discordClient: IDiscordClient,
    memberRepository: IMemberRepository,
    roleRepository: IRoleRepository,
  ) {
    this.discordClient = discordClient;
    this.memberRepository = memberRepository;
    this.roleRepository = roleRepository;
  }

  async fetchMembers(guildId: string): Promise<void> {
    const members = await this.discordClient
      .fetchGuildMembers(guildId)
      .catch((e) => {
        throw new Error(`Failed to fetch group members: ${e}`);
      });

    const memberData = members
      .map((member) => {
        if (!member.user.bot) {
          return {
            memberId: member.user.id,
            userName: member.user.username,
            nickName: member.nick || member.user.global_name,
            roles: member.roles,
          };
        }
      })
      .filter((member) => member !== undefined) as {
      memberId: string;
      userName: string;
      nickName: string | null;
      roles: string[];
    }[];

    const existingMembers = await this.memberRepository
      .findByIds(memberData.map((member) => member.memberId))
      .catch((e) => {
        throw new Error(`Failed to fetch existing members: ${e}`);
      });

    const memberToInsert = memberData.filter(
      (member) =>
        !existingMembers.some(
          (existingMember) => existingMember.memberId === member.memberId,
        ),
    );

    const memberToUpdate = memberData
      .map((member) => {
        const existingMember = existingMembers.find(
          (existingMember) => existingMember.memberId === member.memberId,
        );
        if (!existingMember) {
          return;
        }

        const existRoleSet = new Set(
          existingMember?.roles?.map((role) => role.roleId),
        );

        const newRoleSet = new Set(member.roles);
        const diff = [...newRoleSet].filter((role) => !existRoleSet.has(role));

        const isDiffMemberInfo =
          existingMember?.userName !== member.userName ||
          existingMember?.nickName !== member.nickName;

        if (diff.length > 0 || isDiffMemberInfo) {
          return {
            ...member,
            roles: diff,
          };
        }
      })
      .filter((member) => member !== undefined) as {
      memberId: string;
      userName: string;
      nickName: string | null;
      roles: string[];
    }[];

    const deletedMembers = existingMembers.filter(
      (existingMember) =>
        !memberData.some(
          (member) => member.memberId === existingMember.memberId,
        ),
    );

    if (memberToInsert.length > 0) {
      // NOTE: sqliteでは100以上の変数を一度にバインドできないのでいくつかのチャンクに分けて挿入する
      const chunkSize = 10;
      const chunks = [];
      for (let i = 0; i < memberToInsert.length; i += chunkSize) {
        chunks.push(memberToInsert.slice(i, i + chunkSize));
      }

      for (const chunk of chunks) {
        await this.memberRepository.bulkInsert(chunk).catch((e) => {
          throw new Error(`Failed to insert group members: ${e}`);
        });
      }
    }

    if (memberToUpdate.length > 0) {
      await this.memberRepository.bulkUpdate(memberToUpdate).catch((e) => {
        throw new Error(`Failed to update group members: ${e}`);
      });
    }

    if (deletedMembers.length > 0) {
      await this.memberRepository
        .delete(deletedMembers.map((member) => member.memberId))
        .catch((e) => {
          throw new Error(`Failed to delete group members: ${e}`);
        });
    }
  }

  async fetchRoles(guildId: string): Promise<void> {
    const roles = await this.discordClient
      .fetchGuildRoles(guildId)
      .catch((e) => {
        throw new Error(`Failed to fetch group roles: ${e}`);
      });

    const roleData = roles.map((role) => ({
      roleId: role.id,
      name: role.name,
    }));

    const existingRoles = await this.roleRepository
      .findByIds(roleData.map((role) => role.roleId))
      .catch((e) => {
        throw new Error(`Failed to fetch existing roles: ${e}`);
      });

    const deletedRoles = existingRoles.filter(
      (existingRole) =>
        !roleData.some((role) => role.roleId === existingRole.roleId),
    );

    const roleToInsert = roleData.filter(
      (role) =>
        !existingRoles.some(
          (existingRole) => existingRole.roleId === role.roleId,
        ),
    );

    const roleToUpdate = roleData
      .map((role) => {
        const existingRole = existingRoles.find(
          (existingRole) => existingRole.roleId === role.roleId,
        );

        if (existingRole && existingRole.name !== role.name) {
          return {
            ...role,
            name: role.name,
          };
        }
      })
      .filter((role) => role !== undefined) as {
      roleId: string;
      name: string;
    }[];

    if (roleToInsert.length > 0) {
      await this.roleRepository.insert(roleToInsert).catch((e) => {
        throw new Error(`Failed to insert group roles: ${e}`);
      });
    }
    if (deletedRoles.length > 0) {
      await this.roleRepository
        .delete(deletedRoles.map((role) => role.roleId))
        .catch((e) => {
          throw new Error(`Failed to delete group roles: ${e}`);
        });
    }

    // TODO: n+1になっているので後で修正
    if (roleToUpdate.length > 0) {
      for (const role of roleToUpdate) {
        await this.roleRepository.update(role.roleId, role).catch((e) => {
          throw new Error(`Failed to update group roles: ${e}`);
        });
      }
    }
  }
}
