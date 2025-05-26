import type { IDiscordClient } from "@/domain/repositories/discord";
import { TOKENS } from "@/tokens";
import { inject, injectable } from "inversify";

export interface ISubscribeService {
  subscribeCommand(): Promise<void>;
}

@injectable()
export class SubscribeService implements ISubscribeService {
  @inject(TOKENS.DiscordClient)
  private discordClient!: IDiscordClient;

  async subscribeCommand(): Promise<void> {
    await this.discordClient.subscribeCommand().catch((err) => {
      throw new Error("サブコマンドの登録に失敗しました");
    });
  }
}
