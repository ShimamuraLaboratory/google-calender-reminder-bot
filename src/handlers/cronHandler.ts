import type { IFetchServerInfoService } from "@/services/fetchServerInfoService";
import { TOKENS } from "@/tokens";
import { inject, injectable } from "inversify";

@injectable()
export class CronHandler {
  @inject(TOKENS.FetchServerInfoService)
  private fetchServerInfoService?: IFetchServerInfoService;

  async handleFetchMemberInfo(): Promise<void> {
    if (!this.fetchServerInfoService) {
      throw new Error("fetchServerInfoService is not initialized");
    }

    await this.fetchServerInfoService.fetchMembers().catch((e) => {
      throw new Error(`Failed to fetch group members: ${e}`);
    });
  }

  async handleFetchRoleInfo(): Promise<void> {
    if (!this.fetchServerInfoService) {
      throw new Error("fetchServerInfoService is not initialized");
    }

    await this.fetchServerInfoService.fetchRoles().catch((e) => {
      throw new Error(`Failed to fetch group roles: ${e}`);
    });
  }
}
