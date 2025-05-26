import {
  SUB_COMMAND_ADD,
  SUB_COMMAND_DELETE,
  SUB_COMMAND_LIST,
  SUB_COMMAND_SHOW,
  SUB_COMMANDS,
} from "@/constant";
import type {
  ICommandService,
  ListCommandParams,
} from "@/services/commandService";
import { TOKENS } from "@/tokens";
import { inject, injectable } from "inversify";
import type { InteractionResponse, SlashCommandBody } from "./type";
import { BaseHandler } from "./baseHandler";
import dayjs from "dayjs";

@injectable()
export class CommandHandler extends BaseHandler {
  @inject(TOKENS.CommandService)
  private commandService!: ICommandService;

  async handleCommand(body: SlashCommandBody): Promise<InteractionResponse> {
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

  handleListCommandImpl(body: SlashCommandBody): ListCommandParams {
    const startAt = body.data?.options?.[0]?.options?.find(
      (option) => option.name === "start_at",
    )?.value;
    const endAt = body.data?.options?.[0]?.options?.find(
      (option) => option.name === "end_at",
    )?.value;

    if (startAt || endAt) {
      this.validateDates(startAt ?? "", endAt ?? "");
    }

    return {
      startAt,
      endAt,
    };
  }

  protected validateDates(startAt: string, endAt: string): void {
    const start = new Date(startAt);
    const end = new Date(endAt);

    // NOTE: startAtが指定されていない場合
    if (startAt === "") {
      if (Number.isNaN(end.getTime())) {
        throw new Error("終了日時が指定されていません");
      }
      return;
    }

    // NOTE: endAtが指定されていない場合
    if (endAt === "") {
      if (Number.isNaN(start.getTime())) {
        throw new Error("開始日時が指定されていません");
      }
      return;
    }

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error("無効な日時が指定されました");
    }

    const _start = dayjs(start);
    const _end = dayjs(end);
    if (_start.isAfter(_end)) {
      throw new Error("終了日時は開始日時よりも後である必要があります");
    }
  }
}
