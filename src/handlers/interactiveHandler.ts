import type { IInteractionService } from "@/services/interactionService";
import { TOKENS } from "@/tokens";
import { inject, injectable } from "inversify";
import type { InteractionResponse, MessageComponentBody } from "./type";
import {
  CUSTOM_ID_ADD_INPUTS_MEMBER_IDS,
  CUSTOM_ID_ADD_INPUTS_ROLE_IDS,
  CUSTOM_ID_DELETE,
  CUSTOM_ID_SHOW,
} from "@/constant";

@injectable()
export class InteractiveHandler {
  @inject(TOKENS.InteractionService)
  private interactionService!: IInteractionService;

  async handleInteraction(
    body: MessageComponentBody,
  ): Promise<InteractionResponse> {
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
}
