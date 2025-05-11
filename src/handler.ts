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
      value: string;
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

  async handleCommand(body: SlashCommandObj) {
    const subCommand = body.data?.name;
    if (SUB_COMMANDS.has(subCommand || "")) {
      throw new Error("Invalid subcommand");
    }
    if (!this.commandService) {
      throw new Error("commandService is not initialized");
    }

    switch (subCommand) {
      case SUB_COMMAND_ADD: {
        const title = body.data?.options?.find(
          (option) => option.name === "title",
        )?.value;
        if (!title) {
          throw new Error("タイトルは必須です");
        }

        const startAt = body.data?.options?.find(
          (option) => option.name === "startAt",
        )?.value;
        if (!startAt) {
          throw new Error("開始日時は必須です");
        }

        const endAt = body.data?.options?.find(
          (option) => option.name === "endAt",
        )?.value;
        if (!endAt) {
          throw new Error("終了日時は必須です");
        }
        if (new Date(startAt) > new Date(endAt)) {
          throw new Error("終了日時は開始日時よりも後である必要があります");
        }

        const description = body.data?.options?.find(
          (option) => option.name === "description",
        )?.value;
        const remindDays = body.data?.options?.find(
          (option) => option.name === "remindDays",
        )?.value;
        const memberIds = body.data?.options?.map((option) => {
          if (option.name.includes("member_")) {
            return option.value;
          }
        });
        const roleIds = body.data?.options?.map((option) => {
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
              memberIds: memberIds?.filter(
                (id) => id !== undefined,
              ) as string[],
              roleIds: roleIds?.filter((id) => id !== undefined) as string[],
            },
          },
        };

        await this.commandService.addCommandImpl(scheduleData).catch((e) => {
          throw new Error(e);
        });
      }
    }
  }

  async handleSubscribeCommand(appId: string, guildId: string) {
    if (!this.subscribeService) {
      throw new Error("subscribeService is not initialized");
    }

    await this.subscribeService.subscribeCommand(appId, guildId).catch((e) => {
      throw new Error(e);
    });
  }
}
