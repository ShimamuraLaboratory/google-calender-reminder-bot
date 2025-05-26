import type { IDiscordClient } from "@/domain/repositories/discord";
import { COMMANDS } from "@/lib/commandSubscription";
import { TOKENS } from "@/tokens";
import type {
  RESTGetAPIGuildMembersResult,
  RESTGetAPIGuildRolesResult,
} from "discord-api-types/v10";
import { inject, injectable } from "inversify";

@injectable()
export class DiscordClient implements IDiscordClient {
  @inject(TOKENS.DISCORD_TOKEN)
  private token!: string;
  @inject(TOKENS.DISCORD_APP_ID)
  private appId!: string;
  @inject(TOKENS.DISCORD_GUILD_ID)
  private guildId!: string;

  private BASE_URL = "https://discord.com/api/v10";
  private config: {
    headers: Record<string, string>;
  };

  constructor() {
    this.config = {
      headers: {
        Authorization: `Bot ${this.token}`,
        "Content-Type": "application/json",
      },
    };
  }

  /**
   * Discordサーバー内のメンバー情報を取得するメソッド
   *
   * @returns
   */
  async fetchGuildMembers(): Promise<RESTGetAPIGuildMembersResult> {
    const response = await fetch(
      `${this.BASE_URL}/guilds/${this.guildId}/members?limit=1000`,
      {
        method: "GET",
        headers: this.config.headers,
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch group members: ${response.statusText}`);
    }

    return response.json() as Promise<RESTGetAPIGuildMembersResult>;
  }

  /**
   * Discordサーバー内のロール情報を取得するメソッド
   *
   * @returns
   */
  async fetchGuildRoles(): Promise<RESTGetAPIGuildRolesResult> {
    const response = await fetch(
      `${this.BASE_URL}/guilds/${this.guildId}/roles`,
      {
        method: "GET",
        headers: this.config.headers,
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch group roles: ${response.statusText}`);
    }

    return response.json() as Promise<RESTGetAPIGuildRolesResult>;
  }

  /**
   * Discordのコマンドをサーバーに登録するメソッド
   *
   * @param commands
   * @returns
   */
  async subscribeCommand(): Promise<void> {
    const response = await fetch(
      `${this.BASE_URL}/applications/${this.appId}/commands`,
      {
        method: "POST",
        headers: this.config.headers,
        body: JSON.stringify(COMMANDS),
      },
    );

    if (response.status !== 201) {
      throw new Error("コマンドの登録に失敗しました");
    }
  }
}
