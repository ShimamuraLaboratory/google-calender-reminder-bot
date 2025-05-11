import type {
  RESTGetAPIGuildMembersResult,
  RESTGetAPIGuildRolesResult,
  RESTPostAPIChannelMessageJSONBody,
  RESTPostAPIChannelMessageResult,
} from "discord-api-types/v10";

export interface IDiscordClient {
  fetchGuildMembers(guildId: string): Promise<RESTGetAPIGuildMembersResult>;
  fetchGuildRoles(guildId: string): Promise<RESTGetAPIGuildRolesResult>;
  subscribeCommand(
    // @ts-ignore
    commands,
    appId: string,
    guildId: string,
  ): Promise<void>;
}

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
    const response = await fetch(`${this.BASE_URL}/guilds/${guildId}/members`, {
      method: "GET",
      headers: this.config.headers,
    });

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
  async subscribeCommand(
    // @ts-ignore
    commands,
    appId: string,
    guildId: string,
  ): Promise<void> {
    const response = await fetch(
      `${this.BASE_URL}/applications/${appId}/guilds/${guildId}/commands`,
      {
        method: "POST",
        headers: this.config.headers,
        body: JSON.stringify(commands),
      },
    );

    if (!response.ok) {
      throw new Error("コマンドの登録に失敗しました");
    }

    return;
  }
}
