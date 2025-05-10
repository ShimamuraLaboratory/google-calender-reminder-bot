const SUB_COMMAND_ADD = "add";
const SUB_COMMAND_LIST = "list";
const SUB_COMMAND_SHOW = "show";
const SUB_COMMAND_UPDATE = "update";
const SUB_COMMAND_DELETE = "delete";

const COMMAND_DISCRIPTIONS: Record<string, string> = {
  [SUB_COMMAND_ADD]: "Googleカレンダーに予定を追加します",
  [SUB_COMMAND_LIST]: "指定期間におけるGoogleカレンダーの予定を一覧表示します",
  [SUB_COMMAND_SHOW]: "指定した予定の詳細を表示します",
  [SUB_COMMAND_UPDATE]: "指定した予定を更新します",
  [SUB_COMMAND_DELETE]: "指定した予定を削除します",
};

export {
  COMMAND_DISCRIPTIONS,
  SUB_COMMAND_ADD,
  SUB_COMMAND_LIST,
  SUB_COMMAND_SHOW,
  SUB_COMMAND_UPDATE,
  SUB_COMMAND_DELETE,
};
