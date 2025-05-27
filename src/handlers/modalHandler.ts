import type { IModalService } from "@/services/modalService";
import { TOKENS } from "@/tokens";
import { inject, injectable } from "inversify";
import type { InteractionResponse, ModalInteractionBody } from "./type";
import {
  CUSTOM_ID_ADD_INPUTS_DESCRIPTION,
  CUSTOM_ID_ADD_INPUTS_END_AT,
  CUSTOM_ID_ADD_INPUTS_REMIND_DAYS,
  CUSTOM_ID_ADD_INPUTS_START_AT,
  CUSTOM_ID_ADD_INPUTS_TITLE,
} from "@/constant";
import { BaseHandler } from "./baseHandler";
import dayjs from "dayjs";

@injectable()
export class ModalHandler extends BaseHandler {
  @inject(TOKENS.ModalService)
  private modalService!: IModalService;

  async handleModal(body: ModalInteractionBody): Promise<InteractionResponse> {
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

    const title = values?.find(
      (option) => option.customId === CUSTOM_ID_ADD_INPUTS_TITLE,
    )?.value;
    const startAt = values?.find(
      (option) => option.customId === CUSTOM_ID_ADD_INPUTS_START_AT,
    )?.value;
    const endAt = values?.find(
      (option) => option.customId === CUSTOM_ID_ADD_INPUTS_END_AT,
    )?.value;
    const remindDays = values?.find(
      (option) => option.customId === CUSTOM_ID_ADD_INPUTS_REMIND_DAYS,
    )?.value;
    const description = values?.find(
      (option) => option.customId === CUSTOM_ID_ADD_INPUTS_DESCRIPTION,
    )?.value;
    const remindDaysNum = remindDays ? Number.parseInt(remindDays, 10) : 0;

    this.validateDates(startAt ?? "", endAt ?? "");

    const message = await this.modalService
      .addModalImpl({
        title: title as string,
        startAt: startAt as string,
        endAt: endAt as string,
        remindDays: remindDaysNum,
        description: description as string,
      })
      .catch((e) => {
        throw new Error(e);
      });

    return message;
  }

  protected validateDates(startAt: string, endAt: string): void {
    if (!startAt || !endAt) {
      throw new Error("開始日時と終了日時は必須です");
    }

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
