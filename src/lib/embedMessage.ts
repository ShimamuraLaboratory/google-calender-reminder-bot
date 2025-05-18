import dayjs from "dayjs";
import type { SubCommandType } from "@/constant";
import type { APIEmbed } from "discord-api-types/v10";

const ADD_EMBED_COLOR = 0x00ff00;
const LIST_EMBED_COLOR = 0x800080;
const SHOW_EMBED_COLOR = 0x00ffff;
const UPDATE_EMBED_COLOR = 0x0000ff;
const DELETE_EMBED_COLOR = 0xff0000;

const ADD_CONTENT = "**イベントを追加しました！**";
const LIST_CONTENT = "**イベント一覧です！**";
const SHOW_CONTENT = "**イベントの詳細です！**";
const UPDATE_CONTENT = "**カレンダーの予定が更新されました！**";
const DELETE_CONTENT = "**カレンダーの予定が削除されました！**";

type MessageData = {
  id: string;
  title: string;
  startAt: string | number;
  endAt: string | number;
  description?: string;
  url?: string;
  options?: Options;
};

type Options = {
  roleIds?: string[];
  memberIds?: string[];
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
      return {
        title: event.title,
        description: embedEvent(event),
        color: LIST_EMBED_COLOR,
      };
    });

    baseMessages.embeds = embeds;

    return baseMessages;
  }

  const baseMessage = embeddedMessageImpls[type]();

  baseMessage.embeds[0].title = data.title;
  baseMessage.embeds[0].description = embedEvent(data);

  return baseMessage;
};

const embeddedMessageImpls: Record<SubCommandType, () => MessageObj> = {
  add: () => {
    return {
      content: ADD_CONTENT,
      embeds: [
        {
          // NOTE: 黄緑色
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
          // NOTE: 水色
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
          // NOTE: 青色
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
          // NOTE: 赤色
          color: DELETE_EMBED_COLOR,
        },
      ],
    };
  },
};

const embedEvent = (event: MessageData) => {
  const msg = [] as string[];
  // NOTE: YYYY年MM月DD日 HH:mm形式に変換
  if (typeof event.startAt === "number" && typeof event.endAt === "number") {
    // NOTE: dayjsはミリ単位の為, 秒単位に変換
    event.startAt = event.startAt * 1000;
    event.endAt = event.endAt * 1000;
  }
  const startAt = dayjs(event.startAt).format("YYYY年MM月DD日 HH:mm");
  const endAt = dayjs(event.endAt).format("YYYY年MM月DD日 HH:mm");

  msg.push(`### 期間: ${startAt} ~ ${endAt} \n`);
  msg.push(`イベントID: ${event.id} \n`);
  if (event.description) {
    msg.push(`詳細: ${event.description} \n`);
  }
  if (event.options) {
    if (event.options.roleIds && event.options.roleIds.length > 0) {
      msg.push(`ロール : @${event.options.roleIds.join(", @")} \n`);
    }
    if (event.options.memberIds && event.options.memberIds.length > 0) {
      msg.push(`メンバー : @${event.options.memberIds.join(", @")} \n`);
    }
  }
  if (event.url) {
    msg.push(`[カレンダーで確認する](${event.url})`);
  }
  return msg.join("");
};

const embedEvents = (events: MessageData[]) => {
  return events.map((event) => embedEvent(event)).join("\n");
};
