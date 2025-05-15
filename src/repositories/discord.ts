import type {
  RESTGetAPIGuildMembersResult,
  RESTGetAPIGuildRolesResult,
} from "discord-api-types/v10";

export interface IDiscordClient {
  fetchGuildMembers(guildId: string): Promise<RESTGetAPIGuildMembersResult>;
  fetchGuildRoles(guildId: string): Promise<RESTGetAPIGuildRolesResult>;
  subscribeCommand(appId: string, guildId: string): Promise<void>;
}
