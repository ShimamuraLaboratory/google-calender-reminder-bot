import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { DiscordClient } from "./repositories/discord/client";
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import { ScheduleRepository } from "./repositories/d1/schedulesRepository";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { CommandService } from "./services/commandService";
import { GoogleCalendarClient } from "./repositories/google/cient";
import { Handlers } from "./handler";
import { RoleRepository } from "./repositories/d1/rolesRepository";
import { MemberRepository } from "./repositories/d1/membersRepository";
import { SubscribeService } from "./services/subscribeService";

export type Bindings = {
  DISCORD_PUBLIC_KEY: string;
  DISCORD_APP_ID: string;
  DISCORD_BOT_TOKEN: string;
  DISCORD_PERMISSION_ID: string;
  DISCORD_GUILD_ID: string;
  REMINDER_CHANNEL_ID: string;
  D1_DATABASE: D1Database;
};

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

const app = new Hono<{ Bindings: Bindings }>();

export const verifyMiddleware = createMiddleware<{ Bindings: Bindings }>(
  async (c, next) => {
    const signature = c.req.header("x-signature-ed25519");
    const timestamp = c.req.header("x-signature-timestamp");
    const rawBody = await c.req.raw.arrayBuffer();

    if (!signature || !timestamp) {
      return c.text("invalid request signature", 401);
    }

    const isValid = await verifyKey(
      rawBody,
      signature,
      timestamp,
      c.env.DISCORD_PUBLIC_KEY,
    );

    if (!isValid) {
      return c.text("invalid request signature", 401);
    }

    const body = JSON.parse(new TextDecoder("utf-8").decode(rawBody));
    if (body.type === InteractionType.PING) {
      return c.json({ type: InteractionResponseType.PONG });
    }

    return await next();
  },
);

app.post("/", verifyMiddleware, async (c) => {
  const body = await c.req.json();

  const db = drizzle(c.env.D1_DATABASE, { schema: schema });

  const discordClient = new DiscordClient(c.env.DISCORD_BOT_TOKEN);
  const googleCalendarClient = new GoogleCalendarClient();
  const scheduleRepository = new ScheduleRepository(db);
  const commandService = new CommandService(
    scheduleRepository,
    discordClient,
    googleCalendarClient,
    c.env.REMINDER_CHANNEL_ID,
  );
  const handler = new Handlers(commandService);

  await handler
    .handleCommand(body)
    .then((response) => {
      c.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: response,
          flags: 64,
        },
      });
    })
    .catch((e) => {
      c.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: e.message,
          flags: 64,
        },
      });
    });
});

app.all("/subscribe_command", async (c) => {
  const db = drizzle(c.env.D1_DATABASE, { schema: schema });

  const discordClient = new DiscordClient(c.env.DISCORD_BOT_TOKEN);
  const roleRepository = new RoleRepository(db);
  const memberRepository = new MemberRepository(db);

  const subscribeService = new SubscribeService(
    discordClient,
    roleRepository,
    memberRepository,
  );

  const handler = new Handlers(undefined, subscribeService);

  await handler
    .handleSubscribeCommand(c.env.DISCORD_APP_ID, c.env.DISCORD_GUILD_ID)
    .catch((err) => {
      return c.text(`サブコマンドの登録に失敗しました: ${err.message}`, 500);
    });

  return c.text("コマンドの登録が完了しました");
});

export default app;
