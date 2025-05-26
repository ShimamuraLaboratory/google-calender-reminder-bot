import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { DiscordClient } from "./infra/repositories/discord/client";
import { MemberRepository } from "./infra/repositories/d1/membersRepository";
import { RoleRepository } from "./infra/repositories/d1/rolesRepository";
import {
  FetchServerInfoService,
  type IFetchServerInfoService,
} from "./services/fetchServerInfoService";
import { CronHandler } from "./handlers/cronHandler";
import { Container } from "inversify";
import type { IDiscordClient } from "./domain/repositories/discord";
import { TOKENS } from "./tokens";
import type { IMemberRepository } from "./domain/repositories/members";
import type { IRoleRepository } from "./domain/repositories/roles";

type Bindings = {
  DISCORD_PUBLIC_KEY: string;
  DISCORD_APP_ID: string;
  DISCORD_BOT_TOKEN: string;
  DISCORD_GUILD_ID: string;
  REMINDER_CHANNEL_ID: string;
  D1_DATABASE: D1Database;
};

const rootContainer = new Container({ defaultScope: "Singleton" });

rootContainer.bind<IDiscordClient>(TOKENS.DiscordClient).to(DiscordClient);
rootContainer
  .bind<IMemberRepository>(TOKENS.MemberRepository)
  .to(MemberRepository);
rootContainer.bind<IRoleRepository>(TOKENS.RoleRepository).to(RoleRepository);
rootContainer
  .bind<IFetchServerInfoService>(TOKENS.FetchServerInfoService)
  .to(FetchServerInfoService);
rootContainer.bind<CronHandler>(TOKENS.CronHandler).to(CronHandler);

const scheduled: ExportedHandler<Bindings>["scheduled"] = async (
  event,
  env,
) => {
  const childContainer = new Container({
    parent: rootContainer,
    defaultScope: "Singleton",
  });
  childContainer
    .bind<string>(TOKENS.DISCORD_APP_ID)
    .toConstantValue(env.DISCORD_APP_ID);
  childContainer
    .bind<string>(TOKENS.DISCORD_GUILD_ID)
    .toConstantValue(env.DISCORD_GUILD_ID);
  childContainer
    .bind<string>(TOKENS.DISCORD_TOKEN)
    .toConstantValue(env.DISCORD_BOT_TOKEN);
  childContainer
    .bind<string>(TOKENS.DISCORD_PUBLIC_KEY)
    .toConstantValue(env.DISCORD_PUBLIC_KEY);
  childContainer
    .bind<string>(TOKENS.REMINDER_CHANNEL_ID)
    .toConstantValue(env.REMINDER_CHANNEL_ID);
  const d1Database = drizzle(env.D1_DATABASE, { schema });
  childContainer
    .bind<DrizzleD1Database<typeof schema>>(TOKENS.D1_DATABASE)
    .toConstantValue(d1Database);

  const handler = childContainer.get(CronHandler);

  switch (event.cron) {
    case "0 * * * *": {
      await handler.handleFetchRoleInfo();
      break;
    }
    case "0 0 * * *": {
      await handler.handleFetchMemberInfo();
      break;
    }
  }
};

export default scheduled;
