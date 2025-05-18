import type {
  ComponentObj,
  ICommandService,
  ModalObj,
} from "./services/commandService";
import type { ISubscribeService } from "./services/subscribeService";
import type { APIBaseInteraction, APIEmbed } from "discord-api-types/v10";
import { InteractionType } from "discord-api-types/v10";
import {
  CUSTOM_ID_DELETE,
  CUSTOM_ID_SHOW,
  SUB_COMMAND_ADD,
  SUB_COMMAND_DELETE,
  SUB_COMMAND_SHOW,
  SUB_COMMANDS,
  SUB_COMMAND_LIST,
  CUSTOM_ID_ADD_INPUTS_TITLE,
  CUSTOM_ID_ADD_INPUTS_START_AT,
  CUSTOM_ID_ADD_INPUTS_END_AT,
  CUSTOM_ID_ADD_INPUTS_DESCRIPTION,
  CUSTOM_ID_ADD_INPUTS_MEMBER_IDS,
  CUSTOM_ID_ADD_INPUTS_ROLE_IDS,
} from "./constant";
import type {
  AddCommandParams,
  ListCommandParams,
} from "./services/commandService";
import type { IFetchServerInfoService } from "./services/fetchServerInfoService";
import type { IInteractionService } from "./services/interactionService";
import dayjs from "dayjs";
import type { IModalService } from "./services/modalService";

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

type ModalInteractionObj = APIBaseInteraction<
  InteractionType.ModalSubmit,
  {
    custom_id: string;
    components: {
      type: number;
      components: {
        type: number;
        custom_id: string;
        value: string;
      }[];
    }[];
  }
>;

type InteractionObj =
  | SlashCommandObj
  | MessageComponentObj
  | ModalInteractionObj;

type EmbedResponseObj = {
  content?: string;
  embeds: APIEmbed[];
};

// NOTE: show等セレクトメニューを伴うメッセージのレスポンス
type MessageResponseObj = {
  content: string;
  components?: ComponentObj[];
};

type ModalResponseObj = {
  modal: ModalObj;
};

type InteractionResponseObj =
  | EmbedResponseObj
  | MessageResponseObj
  | ModalResponseObj;

export const isMessageComponentObj = (
  obj: InteractionObj,
): obj is MessageComponentObj => {
  return obj.type === InteractionType.MessageComponent;
};

export const isModalInteractionObj = (
  obj: InteractionObj,
): obj is ModalInteractionObj => {
  return obj.type === InteractionType.ModalSubmit;
};

export const isMessageResponseObj = (
  obj: InteractionResponseObj,
): obj is MessageResponseObj => {
  return !!(obj as MessageResponseObj).components;
};

export const isModalResponseObj = (
  obj: InteractionResponseObj,
): obj is ModalResponseObj => {
  return !!(obj as ModalResponseObj).modal;
};

export class Handlers {
  private commandService: ICommandService | undefined;
  private subscribeService: ISubscribeService | undefined;
  private interactionService: IInteractionService | undefined;
  private modalService: IModalService | undefined;
  private fetchServerInfoService: IFetchServerInfoService | undefined;

  constructor(
    commandService?: ICommandService,
    subscribeService?: ISubscribeService,
    interactionService?: IInteractionService,
    modalService?: IModalService,
    fetchServerInfoService?: IFetchServerInfoService,
  ) {
    this.commandService = commandService;
    this.subscribeService = subscribeService;
    this.interactionService = interactionService;
    this.modalService = modalService;
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

      // NOTE: CUSTOM_ID_ADD_INPUTS_MEMBER_IDSがcustomIdに含まれている場合
      if (customId.includes(CUSTOM_ID_ADD_INPUTS_MEMBER_IDS)) {
        const eventId = customId
          .split(`${CUSTOM_ID_ADD_INPUTS_MEMBER_IDS}_`)
          .slice(-1)[0];
        if (!eventId) {
          throw new Error("不正なイベントIDです");
        }

        const memberIds = values;

        const message = await this.interactionService
          .addInteractionImpl({
            eventId,
            memberIds,
          })
          .catch((e) => {
            throw new Error(e);
          });

        return message;
      }

      if (customId.includes(CUSTOM_ID_ADD_INPUTS_ROLE_IDS)) {
        const eventId = customId
          .split(`${CUSTOM_ID_ADD_INPUTS_ROLE_IDS}_`)
          .slice(-1)[0];
        if (!eventId) {
          throw new Error("不正なイベントIDです");
        }

        const roleIds = values;

        const message = await this.interactionService
          .addInteractionImpl({
            eventId,
            roleIds,
          })
          .catch((e) => {
            throw new Error(e);
          });

        return message;
      }

      switch (customId) {
        case CUSTOM_ID_SHOW: {
          const eventId = values?.[0];
          if (!eventId) {
            throw new Error("不正なイベントIDです");
          }

          const message = await this.interactionService
            .showInteractionImpl(eventId)
            .catch((e) => {
              throw new Error(e);
            });

          return message;
        }
        case CUSTOM_ID_DELETE: {
          const eventId = values?.[0];
          if (!eventId) {
            throw new Error("不正なイベントIDです");
          }

          const message = await this.interactionService
            .deleteInteractionImpl(eventId)
            .catch((e) => {
              throw new Error(e);
            });

          return message;
        }
        default: {
          throw new Error("不正なリクエストです");
        }
      }
    }

    if (isModalInteractionObj(body)) {
      if (!this.modalService) {
        throw new Error("interactionService is not initialized");
      }
      if (!body.data) {
        throw new Error("不正なリクエストです");
      }

      const { custom_id: customId } = body.data;
      if (!customId) {
        throw new Error("不正なリクエストです");
      }
      if (!body.data.components) {
        throw new Error("不正なリクエストです");
      }

      const components = body.data?.components.map((component) => {
        return component.components.map((c) => {
          return {
            customId: c.custom_id,
            value: c.value,
          };
        });
      });
      const values = components.flat();

      console.log("values", values);

      const title = values?.find(
        (option) => option.customId === CUSTOM_ID_ADD_INPUTS_TITLE,
      )?.value;
      const startAt = values?.find(
        (option) => option.customId === CUSTOM_ID_ADD_INPUTS_START_AT,
      )?.value;
      const endAt = values?.find(
        (option) => option.customId === CUSTOM_ID_ADD_INPUTS_END_AT,
      )?.value;
      const description = values?.find(
        (option) => option.customId === CUSTOM_ID_ADD_INPUTS_DESCRIPTION,
      )?.value;

      const message = await this.modalService
        .addModalImpl({
          title: title as string,
          startAt: startAt as string,
          endAt: endAt as string,
          description: description as string,
        })
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
        const message = await this.commandService
          .addCommandImpl()
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
      case SUB_COMMAND_DELETE: {
        const message = await this.commandService
          .deleteCommandImpl()
          .catch((e) => {
            throw new Error(e);
          });
        return message;
      }
      case SUB_COMMAND_LIST: {
        const { startAt, endAt } = this.handleListCommandImpl(body);
        const message = await this.commandService
          .listCommandImpl({ startAt, endAt })
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

  handleListCommandImpl(body: SlashCommandObj): ListCommandParams {
    const startAt = body.data?.options?.[0]?.options?.find(
      (option) => option.name === "start_at",
    )?.value;
    const endAt = body.data?.options?.[0]?.options?.find(
      (option) => option.name === "end_at",
    )?.value;

    return {
      startAt,
      endAt,
    };
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

    const currentDate = dayjs();
    const _start = dayjs(start);
    const _end = dayjs(end);
    if (_start.isBefore(currentDate)) {
      throw new Error("開始日時は現在以降である必要があります");
    }
    if (_end.isBefore(currentDate)) {
      throw new Error("終了日時は現在以降である必要があります");
    }
  }
}
