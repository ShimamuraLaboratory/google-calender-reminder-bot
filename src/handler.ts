import type { ICommandService } from "./services/commandService";
import type { ISubscribeService } from "./services/subscribeService";
import type { APIBaseInteraction, APIEmbed } from "discord-api-types/v10";
import { InteractionType } from "discord-api-types/v10";
import { SUB_COMMAND_ADD, SUB_COMMAND_SHOW, SUB_COMMANDS } from "./constant";
import type { AddCommandParams } from "./services/commandService";
import type { IFetchServerInfoService } from "./services/fetchServerInfoService";
import type { IInteractionService } from "./services/interactionService";

type SlashCommandObj = APIBaseInteraction<
  InteractionType.ApplicationCommand,
  {
    name: string;
    options?: {
      name: string;
      options?: {
        name: string;
        value: string;
      }[];
    }[];
  }
>;

type MessageComponentObj = APIBaseInteraction<
  InteractionType.MessageComponent,
  {
    custom_id: string;
    component_type: number;
    values?: string[];
  }
>;

type InteractionObj = SlashCommandObj | MessageComponentObj;

type EmbedResponseObj = {
  embeds: APIEmbed[];
};

// NOTE: show等セレクトメニューを伴うメッセージのレスポンス
type MessageResponseObj = {
  content: string;
  components?: {
    type: number;
    components: {
      type: number;
      custom_id: string;
      minValues?: number;
      maxValues?: number;
      placeholder?: string;
      options: {
        value: string;
        label: string;
        emoji?: {
          id?: string;
          name?: string;
        };
      }[];
    }[];
  }[];
};

type InteractionResponseObj = EmbedResponseObj | MessageResponseObj;

export const isMessageComponentObj = (
  obj: InteractionObj,
): obj is MessageComponentObj => {
  return obj.type === InteractionType.MessageComponent;
};

export const isMessageResponseObj = (
  obj: InteractionResponseObj,
): obj is MessageResponseObj => {
  return !!(obj as MessageResponseObj).components;
};

export class Handlers {
  private commandService: ICommandService | undefined;
  private subscribeService: ISubscribeService | undefined;
  private interactionService: IInteractionService | undefined;
  private fetchServerInfoService: IFetchServerInfoService | undefined;

  constructor(
    commandService?: ICommandService,
    subscribeService?: ISubscribeService,
    interactionService?: IInteractionService,
    fetchServerInfoService?: IFetchServerInfoService,
  ) {
    this.commandService = commandService;
    this.subscribeService = subscribeService;
    this.interactionService = interactionService;
    this.fetchServerInfoService = fetchServerInfoService;
  }

  async handleCommand(body: InteractionObj): Promise<InteractionResponseObj> {
    if (isMessageComponentObj(body)) {
      if (!this.interactionService) {
        throw new Error("interactionService is not initialized");
      }

      if (!body.data) {
        throw new Error("不正なリクエストです");
      }

      const { custom_id: customId, values } = body.data;
      if (!customId) {
        throw new Error("不正なリクエストです");
      }

      if (!values || values.length === 0) {
        throw new Error("不正なイベントIDです");
      }

      const eventId = values?.[0];

      const message = await this.interactionService
        .showInteractionImpl(eventId)
        .catch((e) => {
          throw new Error(e);
        });

      return message;
    }

    const subCommand = body.data?.options?.[0]?.name;

    if (!SUB_COMMANDS.has(subCommand || "")) {
      throw new Error("Invalid subcommand");
    }
    if (!this.commandService) {
      throw new Error("commandService is not initialized");
    }

    switch (subCommand) {
      case SUB_COMMAND_ADD: {
        const scheduleData = this.handleAddCommandImpl(body);
        const message = await this.commandService
          .addCommandImpl(scheduleData)
          .catch((e) => {
            throw new Error(e);
          });

        return message;
      }
      case SUB_COMMAND_SHOW: {
        const message = await this.commandService
          .showCommandImpl()
          .catch((e) => {
            throw new Error(e);
          });
        return message;
      }
    }

    throw new Error("Invalid subcommand");
  }

  async handleSubscribeCommand(appId: string, guildId: string) {
    if (!this.subscribeService) {
      throw new Error("subscribeService is not initialized");
    }

    await this.subscribeService.subscribeCommand(appId, guildId).catch((e) => {
      throw new Error(e);
    });
  }

  handleAddCommandImpl(body: SlashCommandObj): AddCommandParams {
    const title = body.data?.options?.[0]?.options?.find(
      (option) => option.name === "title",
    )?.value;
    if (!title) {
      throw new Error("タイトルが指定されていません");
    }

    const startAt = body.data?.options?.[0]?.options?.find(
      (option) => option.name === "start_at",
    )?.value;
    if (!startAt) {
      throw new Error("開始日時が指定されていません");
    }

    const endAt = body.data?.options?.[0]?.options?.find(
      (option) => option.name === "end_at",
    )?.value;
    if (!endAt) {
      throw new Error("終了日時が指定されていません");
    }

    this.validateDate(startAt as string, endAt as string);

    const description = body.data?.options?.[0]?.options?.find(
      (option) => option.name === "description",
    )?.value;
    const remindDays = body.data?.options?.[0]?.options?.find(
      (option) => option.name === "remind_days",
    )?.value;

    const scheduleData: AddCommandParams = {
      scheduleData: {
        title,
        startAt,
        endAt,
        description,
        remindDays: Number(remindDays),
      },
    };

    return scheduleData;
  }

  async handleFetchMemberInfo(guildId: string): Promise<void> {
    if (!this.fetchServerInfoService) {
      throw new Error("fetchServerInfoService is not initialized");
    }

    await this.fetchServerInfoService.fetchMembers(guildId).catch((e) => {
      throw new Error(`Failed to fetch group members: ${e}`);
    });
  }

  async handleFetchRoleInfo(guildId: string): Promise<void> {
    if (!this.fetchServerInfoService) {
      throw new Error("fetchServerInfoService is not initialized");
    }

    await this.fetchServerInfoService.fetchRoles(guildId).catch((e) => {
      throw new Error(`Failed to fetch group roles: ${e}`);
    });
  }

  validateDate(startAt: string, endAt: string) {
    const start = new Date(startAt);
    const end = new Date(endAt);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error("無効な日時が指定されました");
    }

    if (start >= end) {
      throw new Error("終了日時は開始日時よりも後である必要があります");
    }

    const currentYear = new Date().getFullYear();
    if (start.getFullYear() < currentYear) {
      throw new Error("開始日時は現在以降である必要があります");
    }
    if (end.getFullYear() < currentYear) {
      throw new Error("終了日時は現在以降である必要があります");
    }
  }
}
