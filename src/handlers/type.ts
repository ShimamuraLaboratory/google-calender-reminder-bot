import type { ComponentObj, ModalObj } from "@/services/commandService";
import type { APIBaseInteraction, APIEmbed } from "discord-api-types/v10";
import { InteractionType } from "discord-api-types/v10";

export type SlashCommandBody = APIBaseInteraction<
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

export type MessageComponentBody = APIBaseInteraction<
  InteractionType.MessageComponent,
  {
    custom_id: string;
    component_type: number;
    values?: string[];
  }
>;

export type ModalInteractionBody = APIBaseInteraction<
  InteractionType.ModalSubmit,
  {
    custom_id: string;
    components: {
      type: number;
      components: {
        type: number;
        custom_id: string;
        value: string;
      }[];
    }[];
  }
>;

export const SLASH_COMMAND = "SlashCommand";
export const MESSAGE_COMPONENT = "MessageComponent";
export const MODAL_INTERACTION = "ModalInteraction";

export type BodyType = "SlashCommand" | "MessageComponent" | "ModalInteraction";

export const bodyDiscriminator = (
  body: SlashCommandBody | MessageComponentBody | ModalInteractionBody,
): BodyType => {
  switch (body.type) {
    case InteractionType.ApplicationCommand:
      return "SlashCommand";
    case InteractionType.MessageComponent:
      return "MessageComponent";
    case InteractionType.ModalSubmit:
      return "ModalInteraction";
    default:
      throw new Error("Unsupported interaction type");
  }
};

export type EmbedResponse = {
  content?: string;
  embeds: APIEmbed[];
};

// NOTE: show等セレクトメニューを伴うメッセージのレスポンス
export type MessageResponse = {
  content: string;
  components?: ComponentObj[];
};

export type ModalResponse = {
  modal: ModalObj;
};

export type InteractionResponse =
  | MessageResponse
  | ModalResponse
  | EmbedResponse;

export const MESSAGE_RESPONSE = "MessageResponse";
export const MODAL_RESPONSE = "ModalResponse";
export const EMBED_RESPONSE = "EmbedResponse";

export type ReponseType = "MessageResponse" | "ModalResponse" | "EmbedResponse";

export const isMessageResponseObj = (
  obj: InteractionResponse,
): obj is MessageResponse => {
  return (obj as MessageResponse).components !== undefined;
};
export const isModalResponseObj = (
  obj: InteractionResponse,
): obj is ModalResponse => {
  return (obj as ModalResponse).modal !== undefined;
};
export const isEmbedResponseObj = (
  obj: InteractionResponse,
): obj is EmbedResponse => {
  return (obj as EmbedResponse).embeds !== undefined;
};
