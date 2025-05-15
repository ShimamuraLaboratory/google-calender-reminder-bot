import type { IDiscordClient } from "@/repositories/discord";
import { COMMANDS } from "@/lib/commandSubscription";
import type {
  RESTGetAPIGuildMembersResult,
  RESTGetAPIGuildRolesResult,
} from "discord-api-types/v10";

export class DiscordClient implements IDiscordClient {
  private BASE_URL = "https://discord.com/api/v10";
  private config: {
    headers: Record<string, string>;
  };

  constructor(token: string) {
    this.config = {
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
    };
  }

  /**
   * Discordサーバー内のメンバー情報を取得するメソッド
   *
   * @param guildId
   * @returns
   */
  async fetchGuildMembers(
    guildId: string,
  ): Promise<RESTGetAPIGuildMembersResult> {
    const response = await fetch(
      `${this.BASE_URL}/guilds/${guildId}/members?limit=1000`,
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
   * @param guildId
   * @returns
   */
  async fetchGuildRoles(guildId: string): Promise<RESTGetAPIGuildRolesResult> {
    const response = await fetch(`${this.BASE_URL}/guilds/${guildId}/roles`, {
      method: "GET",
      headers: this.config.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch group roles: ${response.statusText}`);
    }

    return response.json() as Promise<RESTGetAPIGuildRolesResult>;
  }

  /**
   * Discordのコマンドをサーバーに登録するメソッド
   *
   * @param commands
   * @param appId
   * @param guildId
   * @returns
   */
  async subscribeCommand(appId: string, guildId: string): Promise<void> {
    const response = await fetch(
      `${this.BASE_URL}/applications/${appId}/commands`,
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
