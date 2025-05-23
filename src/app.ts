import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { DiscordClient } from "./infra/repositories/discord/client";
import {
  InteractionResponseType,
  InteractionResponseFlags,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import { ScheduleRepository } from "./infra/repositories/d1/schedulesRepository";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { CommandService } from "./services/commandService";
import { GoogleCalendarClient } from "./infra/repositories/google/cient";
import { Handlers, isMessageResponseObj, isModalResponseObj } from "./handler";
import { SubscribeService } from "./services/subscribeService";
import { InteractionService } from "./services/interactionService";
import { ModalService } from "./services/modalService";

type Bindings = {
  DISCORD_PUBLIC_KEY: string;
  DISCORD_APP_ID: string;
  DISCORD_BOT_TOKEN: string;
  DISCORD_GUILD_ID: string;
  REMINDER_CHANNEL_ID: string;
  D1_DATABASE: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

export const verifyMiddleware = createMiddleware<{ Bindings: Bindings }>(
  async (c, next) => {
    const signature = c.req.header("x-signature-ed25519");
    const timestamp = c.req.header("x-signature-timestamp");
    const rawBody = await c.req.raw.clone().arrayBuffer();

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

    const parsedBody = JSON.parse(new TextDecoder("utf-8").decode(rawBody));
    if (parsedBody.type === InteractionType.PING) {
      return c.json({ type: InteractionResponseType.PONG });
    }

    return await next();
  },
);

app.post("/", verifyMiddleware, async (c) => {
  const body = await c.req.json();

  const db = drizzle(c.env.D1_DATABASE, { schema: schema });

  const scheduleRepository = new ScheduleRepository(db);
  const interactionService = new InteractionService(scheduleRepository);
  const modalService = new ModalService(scheduleRepository);
  const commandService = new CommandService(scheduleRepository);
  const handler = new Handlers(
    commandService,
    undefined,
    interactionService,
    modalService,
  );

  return await handler
    .handleCommand(body)
    .then(async (response) => {
      if (isMessageResponseObj(response)) {
        return c.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: response.content,
            components: response.components,
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }

      if (isModalResponseObj(response)) {
        return c.json({
          type: InteractionResponseType.MODAL,
          data: {
            custom_id: response.modal.custom_id,
            title: response.modal.title,
            components: response.modal.components,
          },
        });
      }

      return c.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: response.content,
          embeds: response.embeds,
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    })
    .catch((e) => {
      return c.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `コマンドの実行に失敗しました: ${e.message}`,
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    });
});

app.patch("/subscribe_command", async (c) => {
  const discordClient = new DiscordClient(c.env.DISCORD_BOT_TOKEN);

  const subscribeService = new SubscribeService(discordClient);

  const handler = new Handlers(undefined, subscribeService);

  await handler
    .handleSubscribeCommand(c.env.DISCORD_APP_ID, c.env.DISCORD_GUILD_ID)
    .catch((err) => {
      return c.text(`サブコマンドの登録に失敗しました: ${err.message}`, 500);
    });

  return c.text("コマンドの登録が完了しました");
});

export default app;
