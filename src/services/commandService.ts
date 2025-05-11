import type { IGoogleCalendarClient } from "@/repositories/google/cient";
import type { IDiscordClient } from "@/repositories/discord/client";
import type { IScheduleRepository } from "@/repositories/d1/schedulesRepository";
import type { AddCommandParams } from "./commandService.type";
import type { RESTPostAPIChannelMessageJSONBody } from "discord-api-types/v10";
import { embeddedMessage } from "@/lib/embeddedMessage";
import { SUB_COMMAND_ADD } from "@/constant";
import { v4 as uuid } from "uuid";

export interface ICommandService {
  addCommandImpl(params: AddCommandParams): Promise<void>;
}

export class CommandService implements ICommandService {
  private scheduleRepository: IScheduleRepository;
  private discordClient: IDiscordClient;
  private googleCalendarClient: IGoogleCalendarClient;
  private channelId: string;

  constructor(
    scheduleRepository: IScheduleRepository,
    discordClient: IDiscordClient,
    googleCalendarClient: IGoogleCalendarClient,
    channelId: string,
  ) {
    this.scheduleRepository = scheduleRepository;
    this.discordClient = discordClient;
    this.googleCalendarClient = googleCalendarClient;
    this.channelId = channelId;
  }

  async addCommandImpl(params: AddCommandParams): Promise<void> {
    const newEvent = await this.googleCalendarClient
      .createEvent({
        summary: params.scheduleData.title,
        start: {
          dateTime: params.scheduleData.startAt,
          timeZone: "Asia/Tokyo",
        },
        end: {
          dateTime: params.scheduleData.endAt,
          timeZone: "Asia/Tokyo",
        },
        description: params.scheduleData.description,
      })
      .catch((e) => {
        throw new Error("Googleカレンダーのイベント作成に失敗しました");
      });

    const scheduleId = uuid();

    await this.scheduleRepository
      .insert(
        {
          id: scheduleId,
          title: params.scheduleData.title,
          startAt: params.scheduleData.startAt,
          endAt: params.scheduleData.endAt,
          description: params.scheduleData.description || null,
          remindDays: params.scheduleData.remindDays || null,
          eventId: newEvent.id || "",
        },
        params.scheduleData.options?.memberIds,
        params.scheduleData.options?.roleIds,
      )
      .catch((e) => {
        throw new Error("イベントデータの挿入に失敗しました");
      });

    // const eventId = newEvent.id;
    const url = "";

    const message = embeddedMessage(SUB_COMMAND_ADD, {
      id: newEvent.id || scheduleId,
      title: params.scheduleData.title,
      startAt: params.scheduleData.startAt,
      endAt: params.scheduleData.endAt,
      description: params.scheduleData.description,
      url,
      options: {
        roleIds: params.scheduleData.options?.roleIds,
        memberIds: params.scheduleData.options?.memberIds,
      },
    });

    await this.discordClient
      .sendMessage(this.channelId, {
        content: message,
      } as RESTPostAPIChannelMessageJSONBody)
      .catch((e) => {
        throw new Error("Discordメッセージの送信に失敗しました");
      });
  }
}
