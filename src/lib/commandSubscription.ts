import { COMMAND_DESCRIPTIONS, SUB_COMMAND_ADD, SUB_COMMAND_LIST } from "@/constant";

export const COMMANDS = {
  name: "calendar",
  description: "Googleカレンダーの予定を管理します",
  options: [
    {
      name: SUB_COMMAND_ADD,
      description: COMMAND_DESCRIPTIONS[SUB_COMMAND_ADD],
      type: 1,
      options: [
        {
          name: "title",
          description: "予定のタイトル",
          type: 3,
          required: true,
        },
        {
          name: "start_at",
          description: "予定の開始日時(YYYY-MM-DDTHH:mm)",
          type: 3,
          required: true,
        },
        {
          name: "end_at",
          description: "予定の終了日時(YYYY-MM-DDTHH:mm)",
          type: 3,
          required: true,
        },
        {
          name: "description",
          description: "予定の詳細",
          type: 3,
        },
        {
          name: "remind_days",
          description: "何日前にリマインドするか",
          type: 4,
          choices: [
            {
              name: "1日前",
              value: 1,
            },
            {
              name: "2日前",
              value: 2,
            },
            {
              name: "3日前",
              value: 3,
            },
            {
              name: "4日前",
              value: 4,
            },
            {
              name: "5日前",
              value: 5,
            },
          ],
        },
      ],
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
          required: false,
        },
        {
          name: "end_at",
          description: "検索範囲の終了日時(YYYY-MM-DDTHH:mm)",
          type: 3,
          required: false,
        },
      ],
    },
  ],
};
