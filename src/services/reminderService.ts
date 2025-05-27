import type { IDiscordClient } from "@/domain/repositories/discord";
import type { IRemindRepository } from "@/domain/repositories/reminds";
import type { IScheduleRepository } from "@/domain/repositories/schedules";
import { embeddedMessage, generateRemindEmbed } from "@/lib/embedMessage";
import { TOKENS } from "@/tokens";
import dayjs from "dayjs";
import type { APIEmbed } from "discord-api-types/v10";
import { inject, injectable } from "inversify";

const REMIND_CONTENT = "**リマインドの通知です！**";

export interface IReminderService {
  sendReminders(): Promise<void>;
}

@injectable()
export class ReminderService {
  @inject(TOKENS.RemindRepository)
  private remindRepository!: IRemindRepository;
  @inject(TOKENS.DiscordClient)
  private discordClient!: IDiscordClient;
  @inject(TOKENS.ScheduleRepository)
  private scheduleRepository!: IScheduleRepository;
  @inject(TOKENS.REMINDER_CHANNEL_ID)
  private reminderChannelId!: string;

  async sendReminders(): Promise<void> {
    const now = dayjs().unix(); // 現在のUNIXタイムスタンプをミリ秒単位で取得

    const remindableSchedules = await this.scheduleRepository
      .findAbleToRemind(now)
      .catch((e) => {
        console.log("[ERROR] Failed to send reminds:", e);
        throw new Error(`Failed to fetch schedules: ${e}`);
      });

    if (remindableSchedules.length === 0) {
      console.log("[INFO] No schedules to remind.");
      return;
    }

    const msgObj: {
      content: string;
      embeds: APIEmbed[];
    } = {
      content: REMIND_CONTENT,
      embeds: [],
    };

    const remindDatas = remindableSchedules.map((schedule) => {
      const untillDays = dayjs(schedule.startAt).diff(now, "day");
      const embedMsg = generateRemindEmbed(untillDays, schedule);

      const memberIds =
        schedule.members?.map((member) => member.memberId) || [];
      const memberIdsFromRoles =
        schedule.roles
          ?.flatMap((role) => role.members?.map((member) => member.memberId))
          .filter((memberId) => memberId !== null && memberId !== undefined) ||
        [];

      // NOTE: 重複を排除
      const allMemberIds = Array.from(
        new Set([...memberIds, ...memberIdsFromRoles]),
      );

      msgObj.embeds.push(embedMsg);

      return {
        data: {
          id: crypto.randomUUID(),
          scheduleId: schedule.id,
          text: JSON.stringify(embedMsg),
        },
        memberIds: allMemberIds,
      };
    });

    await this.remindRepository.insert(remindDatas).catch((e) => {
      console.log("[ERROR] Failed to send reminds:", e);
      throw new Error(`Failed to insert reminders: ${e}`);
    });

    this.discordClient
      .sendMessage(this.reminderChannelId, msgObj)
      .catch((e) => {
        console.log("[ERROR] Failed to send reminders to Discord:", e);
        throw new Error(`Failed to send reminders to Discord: ${e}`);
      });
  }
}
