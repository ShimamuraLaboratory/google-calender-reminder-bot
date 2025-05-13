import dayjs from "dayjs";
import type { SubCommandType } from "@/constant";

type MessageData = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  description?: string;
  url: string;
  options?: Options;
};

type Options = {
  roleIds?: string[];
  memberIds?: string[];
};

export const embeddedMessage = (
  type: SubCommandType,
  data: MessageData | MessageData[],
) => {
  const baseMessage = embeddedMessageImpls[type]();

  if (Array.isArray(data)) {
    return baseMessage.replace("{events}", embeddedEvents(data));
  }

  return baseMessage.replace("{event}", embeddEvent(data));
};

const embeddedMessageImpls: Record<SubCommandType, () => string> = {
  add: () => {
    return "## カレンダーに予定が追加されました！\n \n {event}";
  },
  list: () => {
    return "## カレンダーの予定一覧です！\n {events}";
  },
  show: () => {
    return "## カレンダーの予定詳細です！\n {event}";
  },
  update: () => {
    return "## カレンダーの予定が更新されました！\n {event}";
  },
  delete: () => {
    return "## カレンダーの予定が削除されました！\n {event}";
  },
};

const embeddedOptions = (roleIds?: string[], memberIds?: string[]) => {
  if (!roleIds && !memberIds) {
    return "";
  }

  let options = "";
  if (roleIds && roleIds.length > 0) {
    options += `ロール : @${roleIds.join(", @")} \n`;
  }

  if (memberIds && memberIds.length > 0) {
    options += `メンバー : @${memberIds.join(", @")} \n`;
  }

  return options;
};

const embeddEvent = (event: MessageData) => {
  const msg = [] as string[];
  msg.push(`### タイトル: ${event.title} \n`);
  msg.push(`イベントID: ${event.id} \n`);

  // NOTE: YYYY年MM月DD日 HH:mm形式に変換
  const startAt = dayjs(event.startAt).format("YYYY年MM月DD日 HH:mm");
  const endAt = dayjs(event.endAt).format("YYYY年MM月DD日 HH:mm");

  msg.push(`期間: ${startAt} ~ ${endAt} \n`);
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
  msg.push(`[リンク](${event.url})`);
  return msg.join("");
};

const embeddedEvents = (events: MessageData[]) => {
  return events.map((event) => embeddEvent(event)).join("\n");
};
