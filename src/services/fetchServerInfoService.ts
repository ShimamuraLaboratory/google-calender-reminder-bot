import type { IDiscordClient } from "@/repositories/discord/client";
import type { IMemberRepository } from "@/repositories/d1/membersRepository";
import type { IRoleRepository } from "@/repositories/d1/rolesRepository";

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

    const memberData = members.map((member) => ({
      memberId: member.user.id,
      userName: member.user.username,
      roles: member.roles,
    }));
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

        const existRoleSet = new Set(
          existingMember?.roles?.map((role) => role.roleId),
        );

        const newRoleSet = new Set(member.roles);
        const diff = [...newRoleSet].filter((role) => !existRoleSet.has(role));

        if (diff.length > 0) {
          return {
            ...member,
            roles: diff,
          };
        }
      })
      .filter((member) => member !== undefined) as {
      memberId: string;
      userName: string;
      roles: string[];
    }[];

    await this.memberRepository.bulkInsert(memberToInsert).catch((e) => {
      throw new Error(`Failed to insert group members: ${e}`);
    });

    await this.memberRepository.bulkUpdate(memberToUpdate).catch((e) => {
      throw new Error(`Failed to update group members: ${e}`);
    });
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

    await this.roleRepository.insert(roleToInsert).catch((e) => {
      throw new Error(`Failed to insert group roles: ${e}`);
    });
  }
}
