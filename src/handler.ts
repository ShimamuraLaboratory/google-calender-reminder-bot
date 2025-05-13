import type { ICommandService } from "./services/commandService";
import type { ISubscribeService } from "./services/subscribeService";
import type {
  APIBaseInteraction,
  InteractionType,
} from "discord-api-types/v10";
import { SUB_COMMAND_ADD, SUB_COMMANDS } from "./constant";
import type { AddCommandParams } from "./services/commandService.type";

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

export class Handlers {
  private commandService: ICommandService | undefined;
  private subscribeService: ISubscribeService | undefined;

  constructor(
    commandService?: ICommandService,
    subscribeService?: ISubscribeService,
  ) {
    this.commandService = commandService;
    this.subscribeService = subscribeService;
  }

  async handleCommand(body: SlashCommandObj): Promise<string> {
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
    const memberIds = body.data?.options?.[0]?.options?.map((option) => {
      if (option.name.includes("member_")) {
        return option.value;
      }
    });
    const roleIds = body.data?.options?.[0]?.options?.map((option) => {
      if (option.name.includes("role_")) {
        return option.value;
      }
    });

    const scheduleData: AddCommandParams = {
      scheduleData: {
        title,
        startAt,
        endAt,
        description,
        remindDays: Number(remindDays),
        options: {
          memberIds: memberIds?.filter((id) => id !== undefined) as string[],
          roleIds: roleIds?.filter((id) => id !== undefined) as string[],
        },
      },
    };

    return scheduleData;
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
