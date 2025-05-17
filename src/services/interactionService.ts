import { SUB_COMMAND_SHOW } from "@/constant";
import { embeddedMessage } from "@/lib/embedMessage";
import type { IScheduleRepository } from "@/domain/repositories/schedules";
import type { APIEmbed } from "discord-api-types/v10";

export interface IInteractionService {
  showInteractionImpl(eventId: string): Promise<{
    embeds: APIEmbed[];
  }>;
}

export class InteractionService implements IInteractionService {
  private scheduleRepository: IScheduleRepository;
  constructor(scheduleRepository: IScheduleRepository) {
    this.scheduleRepository = scheduleRepository;
  }

  async showInteractionImpl(eventId: string): Promise<{ embeds: APIEmbed[] }> {
    const event = await this.scheduleRepository.findById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    const embedMsg = embeddedMessage(SUB_COMMAND_SHOW, event);
    return embedMsg;
  }
}
