import type { IScheduleRepository } from "@/domain/repositories/schedules";
import { embeddedMessage } from "@/lib/embedMessage";
import {
  CUSTOM_ID_ADD_INPUTS_DESCRIPTION,
  CUSTOM_ID_ADD_INPUTS_END_AT,
  CUSTOM_ID_ADD_INPUTS_REMIND_DAYS,
  CUSTOM_ID_ADD_INPUTS_START_AT,
  CUSTOM_ID_ADD_INPUTS_TITLE,
  CUSTOM_ID_ADD_MODAL,
  CUSTOM_ID_DELETE,
  CUSTOM_ID_SHOW,
  SUB_COMMAND_LIST,
} from "@/constant";
import {
  ComponentType,
  TextInputStyle,
  type APIEmbed,
} from "discord-api-types/v10";
import dayjs from "dayjs";
import { inject, injectable } from "inversify";
import { TOKENS } from "@/tokens";

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

export type ListCommandParams = {
  startAt?: string;
  endAt?: string;
};

export type ComponentObj = {
  type: number;
  components: {
    type: number;
    placeholder?: string;
    custom_id: string;
    min_values?: number;
    max_values?: number;
    label?: string;
    style?: number;
    options?: {
      value: string;
      label: string;
      emoji?: {
        id?: string;
        name?: string;
      };
    }[];
  }[];
};

export type ModalObj = {
  custom_id: string;
  title: string;
  components: ComponentObj[];
};

export interface ICommandService {
  addCommandImpl(): Promise<{
    modal: ModalObj;
  }>;
  showCommandImpl(): Promise<{
    content: string;
    components?: ComponentObj[];
  }>;
  deleteCommandImpl(): Promise<{
    content: string;
    components?: ComponentObj[];
  }>;
  listCommandImpl(params: ListCommandParams): Promise<{
    embeds: APIEmbed[];
  }>;
}

@injectable()
export class CommandService implements ICommandService {
  @inject(TOKENS.ScheduleRepository)
  private scheduleRepository!: IScheduleRepository;

  async addCommandImpl(): Promise<{
    modal: ModalObj;
  }> {
    const modal = {
      custom_id: CUSTOM_ID_ADD_MODAL,
      title: "イベント情報の入力",
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.TextInput,
              custom_id: CUSTOM_ID_ADD_INPUTS_TITLE,
              label: "イベント名",
              placeholder: "イベント名を入力してください",
              style: TextInputStyle.Short,
              min_length: 1,
              max_length: 100,
              required: true,
            },
          ],
        },
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.TextInput,
              custom_id: CUSTOM_ID_ADD_INPUTS_START_AT,
              label: "開始日時",
              placeholder: "YYYY-MM-DD HH:mm:ss",
              style: TextInputStyle.Short,
              min_length: 1,
              max_length: 100,
              required: true,
            },
          ],
        },
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.TextInput,
              custom_id: CUSTOM_ID_ADD_INPUTS_END_AT,
              label: "終了日時",
              placeholder: "YYYY-MM-DD HH:mm:ss",
              style: TextInputStyle.Short,
              min_length: 1,
              max_length: 100,
              required: true,
            },
          ],
        },
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.TextInput,
              custom_id: CUSTOM_ID_ADD_INPUTS_REMIND_DAYS,
              label: "リマインド日数",
              placeholder: "リマインドを行う日数を入力してください（任意）",
              style: TextInputStyle.Short,
              min_length: 0,
              max_length: 3,
              required: false,
            },
          ],
        },
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.TextInput,
              custom_id: CUSTOM_ID_ADD_INPUTS_DESCRIPTION,
              label: "説明",
              placeholder: "イベントの説明を入力してください（任意",
              style: TextInputStyle.Paragraph,
              min_length: 0,
              max_length: 2000,
              required: false,
            },
          ],
        },
      ],
    };

    return {
      modal: modal,
    };
  }

  async listCommandImpl(params: ListCommandParams): Promise<{
    embeds: APIEmbed[];
  }> {
    const startTimestamp = params.startAt
      ? dayjs(params.startAt).unix()
      : dayjs().unix() + 9 * 60 * 60; // JST (UTC+9)
    const endTimestamp = params.endAt ? dayjs(params.endAt).unix() : undefined;

    const schedules = await this.scheduleRepository
      .findAll({
        startAt: startTimestamp,
        endAt: endTimestamp,
      })
      .catch((e) => {
        throw new Error(`イベントの取得に失敗しました: ${e}`);
      });

    const message = embeddedMessage(SUB_COMMAND_LIST, schedules);

    return message;
  }

  async showCommandImpl(): Promise<{
    content: string;
    components: ComponentObj[];
  }> {
    const message = "### イベントを選択してください \n \n";

    const currentDate = dayjs().unix() + 9 * 60 * 60; // JST (UTC+9)

    const schedules = await this.scheduleRepository
      .findAll({
        startAt: currentDate,
      })
      .catch((e) => {
        throw new Error(`イベントの取得に失敗しました: ${e}`);
      });

    if (schedules.length === 0) {
      return {
        content: "現在、登録されているイベントはありません。",
        components: [],
      };
    }

    return {
      content: message,
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.StringSelect,
              custom_id: CUSTOM_ID_SHOW,
              placeholder: "イベントを選択してください",
              min_values: 1,
              max_values: 1,
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

  async deleteCommandImpl(): Promise<{
    content: string;
    components: ComponentObj[];
  }> {
    const message = "### 削除するイベントを選択してください \n \n";

    const currentDate = dayjs().unix() + 9 * 60 * 60; // JST (UTC+9)

    const schedules = await this.scheduleRepository
      .findAll({
        startAt: currentDate,
      })
      .catch((e) => {
        throw new Error(`イベントの取得に失敗しました: ${e}`);
      });

    if (schedules.length === 0) {
      return {
        content: "現在、登録されているイベントはありません。",
        components: [],
      };
    }

    return {
      content: message,
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.StringSelect,
              custom_id: CUSTOM_ID_DELETE,
              placeholder: "削除するイベントを選択してください",
              min_values: 1,
              max_values: 1,
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
