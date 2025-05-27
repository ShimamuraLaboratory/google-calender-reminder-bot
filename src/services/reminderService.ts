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
    // NOTE: YYYY-MM-DD HH:00の形式で現在の時刻を取得
    const now = dayjs().startOf("minutes").unix() + 9 * 60 * 60; // JST (UTC+9)

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
      console.log(
        `[DEBUG] Start At ${schedule.startAt}, End At ${schedule.endAt} Now ${now}`,
      );

      const embedMsg = generateRemindEmbed(now, schedule);

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

    await this.discordClient
      .sendMessage(this.reminderChannelId, msgObj)
      .catch((e) => {
        console.log("[ERROR] Failed to send reminders to Discord:", e);
        throw new Error(`Failed to send reminders to Discord: ${e}`);
      });
  }
}
