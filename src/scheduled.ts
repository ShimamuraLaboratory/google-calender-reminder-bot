import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { DiscordClient } from "./repositories/discord/client";
import { MemberRepository } from "./repositories/d1/membersRepository";
import { RoleRepository } from "./repositories/d1/rolesRepository";
import { Handlers } from "./handler";
import { FetchServerInfoService } from "./services/fetchServerInfoService";

type Bindings = {
  DISCORD_PUBLIC_KEY: string;
  DISCORD_APP_ID: string;
  DISCORD_BOT_TOKEN: string;
  DISCORD_GUILD_ID: string;
  REMINDER_CHANNEL_ID: string;
  D1_DATABASE: D1Database;
};

const scheduled: ExportedHandler<Bindings>["scheduled"] = async (
  event,
  env,
) => {
  const db = drizzle(env.D1_DATABASE, { schema: schema });

  const discordClient = new DiscordClient(env.DISCORD_BOT_TOKEN);
  const memberRepository = new MemberRepository(db);
  const roleRepository = new RoleRepository(db);
  const fetchServerInfoService = new FetchServerInfoService(
    discordClient,
    memberRepository,
    roleRepository,
  );

  const handler = new Handlers(undefined, undefined, fetchServerInfoService);

  switch (event.cron) {
    case "0 * * * *": {
      await handler.handleFetchRoleInfo(env.DISCORD_GUILD_ID);
      break;
    }
    case "0 0 * * *": {
      await handler.handleFetchMemberInfo(env.DISCORD_GUILD_ID);
      break;
    }
  }
};

export default scheduled;
