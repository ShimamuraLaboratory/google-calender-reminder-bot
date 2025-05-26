import type {
  RESTGetAPIGuildMembersResult,
  RESTGetAPIGuildRolesResult,
} from "discord-api-types/v10";

export interface IDiscordClient {
  fetchGuildMembers(): Promise<RESTGetAPIGuildMembersResult>;
  fetchGuildRoles(): Promise<RESTGetAPIGuildRolesResult>;
  subscribeCommand(): Promise<void>;
}
