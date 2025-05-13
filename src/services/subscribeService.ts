import type { IDiscordClient } from "@/repositories/discord/client";

export interface ISubscribeService {
  subscribeCommand(appId: string, guildId: string): Promise<void>;
}

export class SubscribeService implements ISubscribeService {
  private discordClient: IDiscordClient;

  constructor(discordClient: IDiscordClient) {
    this.discordClient = discordClient;
  }

  async subscribeCommand(appId: string, guildId: string): Promise<void> {
    await this.discordClient.subscribeCommand(appId, guildId).catch((err) => {
      throw new Error("サブコマンドの登録に失敗しました");
    });
  }
}
