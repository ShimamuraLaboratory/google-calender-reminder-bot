import dayjs from "dayjs";
import type { SubCommandType } from "@/constant";
import type { APIEmbed } from "discord-api-types/v10";
import type { Role } from "@/domain/entities/role";
import type { Member } from "@/domain/entities/member";

const ADD_EMBED_COLOR = 0x00ff00;
const LIST_EMBED_COLOR = 0x800080;
const SHOW_EMBED_COLOR = 0x00ffff;
const UPDATE_EMBED_COLOR = 0x0000ff;
const DELETE_EMBED_COLOR = 0xff0000;
const REMIND_EMBED_COLOR = 0xffff00;

const ADD_CONTENT = "**イベントを追加しました！**";
const LIST_CONTENT = "**イベント一覧です！**";
const SHOW_CONTENT = "**イベントの詳細です！**";
const UPDATE_CONTENT = "**カレンダーの予定が更新されました！**";
const DELETE_CONTENT = "**カレンダーの予定が削除されました！**";

type MessageData = {
  id: string;
  title: string;
  startAt: number;
  endAt: number;
  description?: string;
  url?: string;
  roles?: Role[];
  members?: Member[];
};

type MessageObj = {
  content?: string;
  embeds: APIEmbed[];
};

export const embeddedMessage = (
  type: SubCommandType,
  data: MessageData | MessageData[],
): MessageObj => {
  if (Array.isArray(data)) {
    const baseMessages = embeddedMessageImpls[type]();
    const embeds = data.map((event) => {
      const fields = createFields({
        startAt: event.startAt,
        endAt: event.endAt,
        description: event.description,
        roles: event.roles,
        members: event.members,
      });

      return {
        title: event.title,
        color: LIST_EMBED_COLOR,
        fields: fields,
      };
    });

    baseMessages.embeds = embeds;

    return baseMessages;
  }

  const baseMessage = embeddedMessageImpls[type]();

  baseMessage.embeds[0].title = data.title;
  baseMessage.embeds[0].fields = createFields({
    startAt: data.startAt,
    endAt: data.endAt,
    description: data.description,
    roles: data.roles,
    members: data.members,
  });

  return baseMessage;
};

const embeddedMessageImpls: Record<SubCommandType, () => MessageObj> = {
  add: () => {
    return {
      content: ADD_CONTENT,
      embeds: [
        {
          color: ADD_EMBED_COLOR,
        },
      ],
    };
  },
  list: () => {
    return {
      content: LIST_CONTENT,
      embeds: [],
    };
  },
  show: () => {
    return {
      content: SHOW_CONTENT,
      embeds: [
        {
          color: SHOW_EMBED_COLOR,
        },
      ],
    };
  },
  update: () => {
    return {
      content: UPDATE_CONTENT,
      embeds: [
        {
          color: UPDATE_EMBED_COLOR,
        },
      ],
    };
  },
  delete: () => {
    return {
      content: DELETE_CONTENT,
      embeds: [
        {
          color: DELETE_EMBED_COLOR,
        },
      ],
    };
  },
};

const createFields = (
  params: Omit<MessageData, "id" | "title">,
): APIEmbed["fields"] => {
  const formattedStart = dayjs(params.startAt * 1000).format(
    "YYYY年MM月DD日 HH:mm",
  );
  const formattedEnd = dayjs(params.endAt * 1000).format(
    "YYYY年MM月DD日 HH:mm",
  );

  const fields = [
    {
      name: "開始日時",
      value: `**${formattedStart}**`,
    },
    {
      name: "終了日時",
      value: `**${formattedEnd}**`,
    },
  ];

  if (params.roles && params.roles.length > 0) {
    fields.push({
      name: "対象ロール",
      value: `<@&${params.roles?.map((role) => role.roleId).join("> <@&")}>`,
    });
  }

  if (params.members && params.members.length > 0) {
    fields.push({
      name: "対象メンバー",
      value: `<@${params.members?.map((member) => member.memberId).join("> <@")}>`,
    });
  }

  if (params.description) {
    fields.push({
      name: "説明",
      value: params.description,
    });
  }

  return fields;
};

export const generateRemindEmbed = (
  untillDays: number,
  data: MessageData,
): APIEmbed => {
  const formattedStart = dayjs(data.startAt * 1000).format(
    "YYYY年MM月DD日 HH:mm",
  );
  const formattedEnd = dayjs(data.endAt * 1000).format("YYYY年MM月DD日 HH:mm");

  const title = `${data.title} まであと ${untillDays} 日です！`;

  const fields: APIEmbed["fields"] = [
    {
      name: "イベント名",
      value: `**${data.title}**`,
    },
    {
      name: "開始日時",
      value: `**${formattedStart}**`,
    },
    {
      name: "終了日時",
      value: `**${formattedEnd}**`,
    },
  ];

  if (data.members && data.members.length > 0) {
    fields.push({
      name: "対象メンバー",
      value: `<@${data.members.map((member) => member.memberId).join("> <@")}>`,
    });
  }

  if (data.roles && data.roles.length > 0) {
    fields.push({
      name: "対象ロール",
      value: `<@&${data.roles.map((role) => role.roleId).join("> <@&")}>`,
    });
  }

  if (data.description) {
    fields.push({
      name: "説明",
      value: data.description,
    });
  }

  return {
    title,
    color: REMIND_EMBED_COLOR,
    fields,
  } as APIEmbed;
};
