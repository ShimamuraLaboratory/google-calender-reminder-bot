import type { IScheduleRepository } from "@/domain/repositories/schedules";
import type { ComponentObj } from "./commandService";
import dayjs from "dayjs";
import { v4 as uuid } from "uuid";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import {
  CUSTOM_ID_ADD_INPUTS_MEMBER_IDS,
  CUSTOM_ID_ADD_INPUTS_ROLE_IDS,
} from "@/constant";
import { inject, injectable } from "inversify";
import { TOKENS } from "@/tokens";

export interface IModalService {
  addModalImpl(params: {
    title: string;
    startAt: string;
    endAt: string;
    remindDays?: number;
    description?: string;
  }): Promise<{
    content: string;
    components?: ComponentObj[];
  }>;
}

@injectable()
export class ModalService {
  @inject(TOKENS.ScheduleRepository)
  private scheduleRepository!: IScheduleRepository;

  async addModalImpl({
    title,
    startAt,
    endAt,
    remindDays = 0,
    description,
  }: {
    title: string;
    startAt: string;
    endAt: string;
    remindDays?: number;
    description?: string;
  }): Promise<{
    content: string;
    components?: ComponentObj[];
  }> {
    const eventId = uuid();

    const unixStartAt = dayjs(startAt).unix();
    const unixEndAt = dayjs(endAt).unix();

    const schedule = {
      id: eventId,
      title,
      remindDays,
      startAt: unixStartAt,
      endAt: unixEndAt,
      description,
    };

    await this.scheduleRepository.insert(schedule);

    const components: ComponentObj[] = [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.UserSelect,
            custom_id: `${CUSTOM_ID_ADD_INPUTS_MEMBER_IDS}_${eventId}`,
            placeholder: "メンバーを選択してください",
            min_values: 0,
            max_values: 25,
          },
        ],
      },
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.RoleSelect,
            custom_id: `${CUSTOM_ID_ADD_INPUTS_ROLE_IDS}_${eventId}`,
            placeholder: "ロールを選択してください",
            min_values: 0,
            max_values: 25,
          },
        ],
      },
    ];

    const content =
      "### イベントを追加しました \n 対象メンバーやロールを追加する場合は以下から選択してください \n 選択しない場合はメッセージを削除してください \n ";
    return {
      content,
      components,
    };
  }
}
