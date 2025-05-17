import type { ICalendarClient } from "@/domain/repositories/calendar";
import type { IScheduleRepository } from "@/domain/repositories/schedules";
import { embeddedMessage } from "@/lib/embedMessage";
import { SUB_COMMAND_ADD } from "@/constant";
import { v4 as uuid } from "uuid";
import { ComponentType, type APIEmbed } from "discord-api-types/v10";
import dayjs from "dayjs";

export type AddCommandParams = {
  scheduleData: {
    title: string;
    startAt: string;
    endAt: string;
    description?: string;
    remindDays?: number;
    options?: {
      roleIds?: string[];
      memberIds?: string[];
    };
  };
};

export type ShowCommandParams = {
  eventId: string;
};

export interface ICommandService {
  addCommandImpl(params: AddCommandParams): Promise<{
    embeds: APIEmbed[];
  }>;
  showCommandImpl(): Promise<{
    content: string;
    components: {
      type: number;
      components: {
        type: number;
        placeholder?: string;
        custom_id: string;
        minValues?: number;
        maxValues?: number;
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
          startAt: dayjs(params.scheduleData.startAt).unix(),
          endAt: dayjs(params.scheduleData.endAt).unix(),
          description: params.scheduleData.description,
          remindDays: params.scheduleData.remindDays,
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

  async showCommandImpl(): Promise<{
    content: string;
    components: {
      type: number;
      components: {
        type: number;
        placeholder?: string;
        custom_id: string;
        minValues?: number;
        maxValues?: number;
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
  }> {
    const message = "### イベントを選択してください \n \n";

    const currentDate = dayjs().unix();

    const schedules = await this.scheduleRepository
      .findAll({
        startAt: currentDate,
      })
      .catch((e) => {
        throw new Error(`イベントの取得に失敗しました: ${e}`);
      });

    return {
      content: message,
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.StringSelect,
              custom_id: "select_event",
              placeholder: "イベントを選択してください",
              minValues: 1,
              maxValues: Math.max(25, schedules.length),
              options: schedules.map((schedule) => ({
                value: schedule.id,
                label: schedule.title,
                emoji: {
                  name: "🗓️",
                },
              })),
            },
          ],
        },
      ],
    };
  }
}
