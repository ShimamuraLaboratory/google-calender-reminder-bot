import { COMMAND_DESCRIPTIONS, SUB_COMMAND_ADD } from "@/constant";

const COMMANDS = {
  name: "calendar",
  description: "Googleカレンダーの予定を管理します",
  options: [
    {
      name: SUB_COMMAND_ADD,
      description: COMMAND_DESCRIPTIONS[SUB_COMMAND_ADD],
      options: [
        {
          name: "title",
          description: "予定のタイトル",
          type: 3,
          required: true,
        },
        {
          name: "startAt",
          description: "予定の開始日時(YYYY-MM-DDTHH:mm)",
          type: 3,
          required: true,
        },
        {
          name: "endAt",
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
          name: "remindDays",
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
        {
          name: "options",
          description: "オプション",
          type: 3,
          // NOTE: roleとmemberの指定を行う
          options: [] as Array<{
            name: string;
            description: string;
            type: number;
            choices?: Array<{ name: string; value: string }>;
          }>,
        },
      ],
    },
  ],
};

export const generateCommandSubscription = (
  roles?: Record<string, string>, // NOTE: { roleId: roleName }
  members?: Record<string, string>, // NOTE: { memberId: memberName }
) => {
  const command = structuredClone(COMMANDS);
  if (roles) {
    command.options.map((options) => {
      switch (options.name) {
        case SUB_COMMAND_ADD: {
          if (roles) {
            const roleOptions = [
              {
                name: "role_1",
                description: "リマインドを受け取るロールを指定します",
                type: 3,
                choices: Object.entries(roles).map(([key, value]) => ({
                  name: value,
                  value: key,
                })),
              },
              {
                name: "role_2",
                description: "リマインドを受け取るロールを指定します",
                type: 3,
                choices: Object.entries(roles).map(([key, value]) => ({
                  name: value,
                  value: key,
                })),
              },
              {
                name: "role_3",
                description: "リマインドを受け取るロールを指定します",
                type: 3,
                choices: Object.entries(roles).map(([key, value]) => ({
                  name: value,
                  value: key,
                })),
              },
            ];

            options.options
              ?.find((option) => option.name === "options")
              ?.options?.push(...roleOptions);
          }
          if (members) {
            const memberOptions = [
              {
                name: "member_1",
                description: "リマインドを受け取るメンバーを指定します",
                type: 3,
                choices: Object.entries(members).map(([key, value]) => ({
                  name: value,
                  value: key,
                })),
              },
              {
                name: "member_2",
                description: "リマインドを受け取る2人目のメンバーを指定します",
                type: 3,
                choices: Object.entries(members).map(([key, value]) => ({
                  name: value,
                  value: key,
                })),
              },
              {
                name: "member_3",
                description: "リマインドを受け取る3人目のメンバーを指定します",
                type: 3,
                choices: Object.entries(members).map(([key, value]) => ({
                  name: value,
                  value: key,
                })),
              },
            ];

            options.options
              ?.find((option) => option.name === "options")
              ?.options?.push(...memberOptions);
          }

          break;
        }
      }
    });
  }
  return command;
};
