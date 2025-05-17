import dayjs from "dayjs";
import type { SubCommandType } from "@/constant";
import type { APIEmbed } from "discord-api-types/v10";

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

export const embeddedMessage = (
  type: SubCommandType,
  data: MessageData | MessageData[],
): {
  embeds: APIEmbed[];
} => {
  const baseMessage = embeddedMessageImpls[type]();

  if (Array.isArray(data)) {
    baseMessage.description = embedEvents(data);
  } else {
    baseMessage.description = embedEvent(data);
  }

  return {
    embeds: [baseMessage],
  };
};

const embeddedMessageImpls: Record<SubCommandType, () => APIEmbed> = {
  add: () => {
    return {
      title: "カレンダーの予定が追加されました！",
      // NOTE: 黄緑色
      color: 0x00ff00,
    };
  },
  list: () => {
    return {
      title: "カレンダーの予定一覧です！",
      // NOTE: 紫色
      color: 0x800080,
    };
  },
  show: () => {
    return {
      title: "予定の詳細です！",
      // NOTE: 水色
      color: 0x00ffff,
    };
  },
  update: () => {
    return {
      title: "カレンダーの予定が更新されました！",
      // NOTE: 青色
      color: 0x0000ff,
    };
  },
  delete: () => {
    return {
      title: "カレンダーの予定が削除されました！",
      // NOTE: 赤色
      color: 0xff0000,
    };
  },
};

const embedEvent = (event: MessageData) => {
  const msg = [] as string[];
  msg.push(`## イベント名: ${event.title} \n`);

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
