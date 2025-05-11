import { generateCommandSubscription } from "@/lib/commandSubscription";
import type { IMemberRepository } from "@/repositories/d1/membersRepository";
import type { IRoleRepository } from "@/repositories/d1/rolesRepository";
import type { IDiscordClient } from "@/repositories/discord/client";

export interface ISubscribeService {
  subscribeCommand(appId: string, guildId: string): Promise<void>;
}

export class SubscribeService implements ISubscribeService {
  private discordClient: IDiscordClient;
  private roleRepository: IRoleRepository;
  private memberRepository: IMemberRepository;

  constructor(
    discordClient: IDiscordClient,
    roleRepository: IRoleRepository,
    memberRepository: IMemberRepository,
  ) {
    this.discordClient = discordClient;
    this.roleRepository = roleRepository;
    this.memberRepository = memberRepository;
  }

  async subscribeCommand(appId: string, guildId: string): Promise<void> {
    const roles = await this.roleRepository.findAll();
    const members = await this.memberRepository.findAll();

    const commands = generateCommandSubscription(
      Object.fromEntries(roles.map((role) => [role.roleId, role.name])),
      Object.fromEntries(
        members.map((member) => [member.memberId, member.userName]),
      ),
    );

    await this.discordClient
      .subscribeCommand(commands, appId, guildId)
      .catch((err) => {
        throw new Error("サブコマンドの登録に失敗しました");
      });
  }
}
