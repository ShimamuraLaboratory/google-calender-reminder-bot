const SUB_COMMAND_ADD = "add";
const SUB_COMMAND_LIST = "list";
const SUB_COMMAND_SHOW = "show";
const SUB_COMMAND_UPDATE = "update";
const SUB_COMMAND_DELETE = "delete";

const SUB_COMMANDS = new Set([
  SUB_COMMAND_ADD,
  SUB_COMMAND_LIST,
  SUB_COMMAND_SHOW,
  SUB_COMMAND_UPDATE,
  SUB_COMMAND_DELETE,
]);

const COMMAND_DESCRIPTIONS: Record<string, string> = {
  [SUB_COMMAND_ADD]: "Googleカレンダーに予定を追加します",
  [SUB_COMMAND_LIST]: "指定期間におけるGoogleカレンダーの予定を一覧表示します",
  [SUB_COMMAND_SHOW]: "指定した予定の詳細を表示します",
  [SUB_COMMAND_UPDATE]: "指定した予定を更新します",
  [SUB_COMMAND_DELETE]: "指定した予定を削除します",
};

export type SubCommandType =
  | typeof SUB_COMMAND_ADD
  | typeof SUB_COMMAND_LIST
  | typeof SUB_COMMAND_SHOW
  | typeof SUB_COMMAND_UPDATE
  | typeof SUB_COMMAND_DELETE;

const CUSTOM_ID_ADD = "add";
const CUSTOM_ID_SHOW = "show";
const CUSTOM_ID_UPDATE = "update";
const CUSTOM_ID_DELETE = "delete";

const CUSTOM_IDS = new Set([
  CUSTOM_ID_ADD,
  CUSTOM_ID_SHOW,
  CUSTOM_ID_UPDATE,
  CUSTOM_ID_DELETE,
]);

export {
  COMMAND_DESCRIPTIONS,
  SUB_COMMAND_ADD,
  SUB_COMMAND_LIST,
  SUB_COMMAND_SHOW,
  SUB_COMMAND_UPDATE,
  SUB_COMMAND_DELETE,
  SUB_COMMANDS,
  CUSTOM_ID_ADD,
  CUSTOM_ID_SHOW,
  CUSTOM_ID_UPDATE,
  CUSTOM_ID_DELETE,
  CUSTOM_IDS,
};
