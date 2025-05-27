import type { IDiscordClient } from "@/domain/repositories/discord";
import { COMMANDS } from "@/lib/commandSubscription";
import { TOKENS } from "@/tokens";
import type {
  APIEmbed,
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

  /**
   * 指定チャンネルに対してメッセージを送信するメソッド
   *
   * @param channelId - メッセージを送信するチャンネルのID
   */
  async sendMessage(
    channelId: string,
    msgObj: { content: string; embeds: APIEmbed[] },
  ): Promise<void> {
    console.log("[INFO] Sending message to channel...");
    const response = await fetch(
      `${this.BASE_URL}/channels/${channelId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(msgObj),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    console.log("[INFO] Message sent successfully.");
  }

  /**
   * Discordサーバー内のメンバー情報を取得するメソッド
   */
  async fetchGuildMembers(): Promise<RESTGetAPIGuildMembersResult> {
    console.log("[INFO] Fetching members from Discord...");
    const response = await fetch(
      `${this.BASE_URL}/guilds/${this.guildId}/members?limit=1000`,
      {
        method: "GET",
        headers: {
          Authorization: `Bot ${this.token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch group members: ${response.statusText}`);
    }

    return response.json() as Promise<RESTGetAPIGuildMembersResult>;
  }

  /**
   * Discordサーバー内のロール情報を取得するメソッド
   */
  async fetchGuildRoles(): Promise<RESTGetAPIGuildRolesResult> {
    console.log("[INFO] Fetching roles from Discord...");
    const response = await fetch(
      `${this.BASE_URL}/guilds/${this.guildId}/roles`,
      {
        method: "GET",
        headers: {
          Authorization: `Bot ${this.token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch group roles: ${response.statusText}`);
    }

    return response.json() as Promise<RESTGetAPIGuildRolesResult>;
  }

  /**
   * Discordのコマンドをサーバーに登録するメソッド
   */
  async subscribeCommand(): Promise<void> {
    console.log("[INFO] Subscribing commands to Discord...");
    const response = await fetch(
      `${this.BASE_URL}/applications/${this.appId}/commands`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(COMMANDS),
      },
    );

    if (response.status !== 201) {
      throw new Error("コマンドの登録に失敗しました");
    }
  }
}
