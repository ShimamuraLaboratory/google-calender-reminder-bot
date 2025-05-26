import { inject, injectable } from "inversify";
import { TOKENS } from "@/tokens";
import type { ISubscribeService } from "@/services/subscribeService";

@injectable()
export class SubscribeCommandHandler {
  @inject(TOKENS.SubscribeService)
  private subscribeService!: ISubscribeService;

  async handleSubscribeCommand() {
    if (!this.subscribeService) {
      throw new Error("subscribeService is not initialized");
    }

    await this.subscribeService.subscribeCommand().catch((e) => {
      throw new Error(e);
    });
  }
}
