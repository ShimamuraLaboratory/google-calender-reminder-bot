import type {
  APIEmbed,
  RESTGetAPIGuildMembersResult,
  RESTGetAPIGuildRolesResult,
} from "discord-api-types/v10";

export interface IDiscordClient {
  sendMessage(
    channelId: string,
    msgObj: { content: string; embeds: APIEmbed[] },
  ): Promise<void>;
  fetchGuildMembers(): Promise<RESTGetAPIGuildMembersResult>;
  fetchGuildRoles(): Promise<RESTGetAPIGuildRolesResult>;
  subscribeCommand(): Promise<void>;
}
