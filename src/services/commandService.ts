import type { ICalendarClient } from "@/repositories/calendar";
import type { IScheduleRepository } from "@/repositories/schedules";
import type { AddCommandParams } from "./commandService.type";
import { embeddedMessage } from "@/lib/embeddedMessage";
import { SUB_COMMAND_ADD } from "@/constant";
import { v4 as uuid } from "uuid";
import type { APIEmbed } from "discord-api-types/v10";

export interface ICommandService {
  addCommandImpl(params: AddCommandParams): Promise<{
    embeds: APIEmbed[];
  }>;
}

export class CommandService implements ICommandService {
  private scheduleRepository: IScheduleRepository;
  private calendarClient: ICalendarClient;
  constructor(
    scheduleRepository: IScheduleRepository,
    calendarClient: ICalendarClient,
  ) {
    this.scheduleRepository = scheduleRepository;
    this.calendarClient = calendarClient;
  }

  async addCommandImpl(params: AddCommandParams): Promise<{
    embeds: APIEmbed[];
  }> {
    const newEvent = await this.calendarClient
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
        throw new Error(`Googleカレンダーのイベント作成に失敗しました: ${e}`);
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
        throw new Error(`イベントデータの挿入に失敗しました: ${e}`);
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

    return message;
  }
}
