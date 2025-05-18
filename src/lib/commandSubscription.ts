import {
  COMMAND_DESCRIPTIONS,
  SUB_COMMAND_ADD,
  SUB_COMMAND_DELETE,
  SUB_COMMAND_SHOW,
  SUB_COMMAND_LIST,
} from "@/constant";

export const COMMANDS = {
  name: "calendar",
  description: "Googleカレンダーの予定を管理します",
  options: [
    {
      name: SUB_COMMAND_ADD,
      description: COMMAND_DESCRIPTIONS[SUB_COMMAND_ADD],
      type: 1,
    },
    {
      name: SUB_COMMAND_SHOW,
      description: COMMAND_DESCRIPTIONS[SUB_COMMAND_SHOW],
      type: 1,
    },
    {
      name: SUB_COMMAND_DELETE,
      description: COMMAND_DESCRIPTIONS[SUB_COMMAND_DELETE],
      type: 1,
    },
    {
      name: SUB_COMMAND_LIST,
      description: COMMAND_DESCRIPTIONS[SUB_COMMAND_LIST],
      type: 1,
      options: [
        {
          name: "start_at",
          description: "検索範囲の開始日時(YYYY-MM-DDTHH:mm)",
          type: 3,
        },
        {
          name: "end_at",
          description: "検索範囲の終了日時(YYYY-MM-DDTHH:mm)",
          type: 3,
        },
      ],
    },
  ],
};
