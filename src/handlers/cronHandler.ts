import type { IFetchServerInfoService } from "@/services/fetchServerInfoService";
import type { IReminderService } from "@/services/reminderService";
import { TOKENS } from "@/tokens";
import { inject, injectable } from "inversify";

@injectable()
export class CronHandler {
  @inject(TOKENS.FetchServerInfoService)
  private fetchServerInfoService!: IFetchServerInfoService;
  @inject(TOKENS.ReminderService)
  private reminderService!: IReminderService;

  async handleFetchMemberInfo(): Promise<void> {
    await this.fetchServerInfoService.fetchMembers().catch((e) => {
      throw new Error(`Failed to fetch group members: ${e}`);
    });
  }

  async handleFetchRoleInfo(): Promise<void> {
    await this.fetchServerInfoService.fetchRoles().catch((e) => {
      throw new Error(`Failed to fetch group roles: ${e}`);
    });
  }

  async handleSendReminders(): Promise<void> {
    await this.reminderService.sendReminders().catch((e) => {
      throw new Error(`Failed to send reminders: ${e}`);
    });
  }
}
