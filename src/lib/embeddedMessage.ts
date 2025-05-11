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
    return "カレンダーに予定が追加されました！\n {event}";
  },
  list: () => {
    return "カレンダーの予定一覧です！\n {events}";
  },
  show: () => {
    return "カレンダーの予定詳細です！\n {event}";
  },
  update: () => {
    return "カレンダーの予定が更新されました！\n {event}";
  },
  delete: () => {
    return "カレンダーの予定が削除されました！\n {event}";
  },
};

const embeddedOptions = (roleIds?: string[], memberIds?: string[]) => {
  if (!roleIds && !memberIds) {
    return "";
  }

  let options = "";
  if (roleIds) {
    options += `ロール : @${roleIds.join(", @")} \n`;
  }

  if (memberIds) {
    options += `メンバー : @${memberIds.join(", @")} \n`;
  }

  return options;
};

const embeddEvent = (event: MessageData) => {
  return `イベントID: ${event.id} \n タイトル: ${event.title} \n 期間: ${event.startAt} ~ ${event.endAt} \n 詳細: ${event.description} \n ${embeddedOptions(event.options?.roleIds, event.options?.memberIds)} \n [リンク](${event.url})`;
};

const embeddedEvents = (events: MessageData[]) => {
  return events
    .map((event) => {
      return `イベントID: ${event.id} \n タイトル: ${event.title} \n 期間: ${event.startAt} ~ ${event.endAt} \n 詳細: ${event.description} \n ${embeddedOptions(event.options?.roleIds, event.options?.memberIds)} \n [リンク](${event.url})`;
    })
    .join("\n");
};
