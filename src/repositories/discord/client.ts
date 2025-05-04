import { DISCORD_FETCH_ROLE_URL, DISCORD_FETCH_USER_URL } from "@/constant";
import type {
  RESTGetAPIGuildMembersResult,
  RESTPostAPIChannelMessageResult,
} from "discord-api-types/v10";

export class DiscordClient {
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

  async sendMessage(
    channelId: string,
    body: RESTPostAPIChannelMessageResult,
  ): Promise<RESTPostAPIChannelMessageResult> {
    const response = await fetch(
      `${this.BASE_URL}/channels/${channelId}/messages`,
      {
        method: "POST",
        headers: this.config.headers,
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return response.json();
  }

  async fetchGuildMembers(
    guildId: string,
  ): Promise<RESTGetAPIGuildMembersResult> {
    const response = await fetch(
      DISCORD_FETCH_USER_URL.replace("{guild_id}", guildId),
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

  async fetchGuildRoles(
    guildId: string,
  ): Promise<RESTGetAPIGuildMembersResult> {
    const response = await fetch(
      DISCORD_FETCH_ROLE_URL.replace("{guild_id}", guildId),
      {
        method: "GET",
        headers: this.config.headers,
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch group roles: ${response.statusText}`);
    }

    return response.json() as Promise<RESTGetAPIGuildMembersResult>;
  }
}
