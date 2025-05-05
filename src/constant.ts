const ADD_COMMAND = "add";
const LIST_COMMAND = "list";
const SHOW_COMMAND = "show";
const UPDATE_COMMAND = "update";
const DELETE_COMMAND = "delete";

const COMMANDS: Record<string, string> = {
  [ADD_COMMAND]: "add",
  [LIST_COMMAND]: "list",
  [SHOW_COMMAND]: "show",
  [UPDATE_COMMAND]: "update",
  [DELETE_COMMAND]: "delete",
};

const DISCORD_FETCH_ROLE_URL =
  "https://discord.com/api/v10/guilds/{guild_id}/roles";
const DISCORD_FETCH_USER_URL =
  "https://discord.com/api/v10/guilds/{guild_id}/members";

export {
  COMMANDS as COMMAND_LIST,
  ADD_COMMAND,
  LIST_COMMAND,
  SHOW_COMMAND,
  UPDATE_COMMAND,
  DELETE_COMMAND,
  DISCORD_FETCH_ROLE_URL,
  DISCORD_FETCH_USER_URL,
};
