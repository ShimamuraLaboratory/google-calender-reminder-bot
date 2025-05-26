import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { DiscordClient } from "./infra/repositories/discord/client";
import {
  InteractionResponseType,
  InteractionResponseFlags,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import {
  type ISubscribeService,
  SubscribeService,
} from "./services/subscribeService";
import { Container } from "inversify";
import {
  type InteractionResponse,
  isMessageResponseObj,
  isModalResponseObj,
  MESSAGE_COMPONENT,
  MODAL_INTERACTION,
  SLASH_COMMAND,
} from "./handlers/type";
import { bodyDiscriminator } from "./handlers/type";
import { ModalHandler } from "./handlers/modalHandler";
import { InteractiveHandler } from "./handlers/interactiveHandler";
import type { IDiscordClient } from "./domain/repositories/discord";
import { TOKENS } from "./tokens";
import type { IMemberRepository } from "./domain/repositories/members";
import { MemberRepository } from "./infra/repositories/d1/membersRepository";
import type { IScheduleRepository } from "./domain/repositories/schedules";
import { ScheduleRepository } from "./infra/repositories/d1/schedulesRepository";
import type { IRoleRepository } from "./domain/repositories/roles";
import { RoleRepository } from "./infra/repositories/d1/rolesRepository";
import type { IRemindRepository } from "./domain/repositories/reminds";
import { RemindRepository } from "./infra/repositories/d1/remindRepository";
import {
  CommandService,
  type ICommandService,
} from "./services/commandService";
import {
  FetchServerInfoService,
  type IFetchServerInfoService,
} from "./services/fetchServerInfoService";
import {
  type IInteractionService,
  InteractionService,
} from "./services/interactionService";
import { type IModalService, ModalService } from "./services/modalService";
import { CommandHandler } from "./handlers/commandHandler";
import { SubscribeCommandHandler } from "./handlers/subscribeCommandHandler";

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
rootContainer
  .bind<IScheduleRepository>(TOKENS.ScheduleRepository)
  .to(ScheduleRepository);
rootContainer.bind<IRoleRepository>(TOKENS.RoleRepository).to(RoleRepository);
rootContainer
  .bind<IRemindRepository>(TOKENS.RemindRepository)
  .to(RemindRepository);
rootContainer.bind<ICommandService>(TOKENS.CommandService).to(CommandService);
rootContainer
  .bind<IFetchServerInfoService>(TOKENS.FetchServerInfoService)
  .to(FetchServerInfoService);
rootContainer
  .bind<IInteractionService>(TOKENS.InteractionService)
  .to(InteractionService);
rootContainer
  .bind<ISubscribeService>(TOKENS.SubscribeService)
  .to(SubscribeService);
rootContainer.bind<IModalService>(TOKENS.ModalService).to(ModalService);
rootContainer.bind<CommandHandler>(TOKENS.CommandHandler).to(CommandHandler);
rootContainer
  .bind<SubscribeCommandHandler>(TOKENS.SubscribeCommandHandler)
  .to(SubscribeCommandHandler);
rootContainer
  .bind<InteractiveHandler>(TOKENS.InteractiveHandler)
  .to(InteractiveHandler);
rootContainer.bind<ModalHandler>(TOKENS.ModalHandler).to(ModalHandler);

const childContainer = new Container({ parent: rootContainer });

type Var = {
  container: Container;
};

const app = new Hono<{ Bindings: Bindings; Variables: Var }>();

app.use("*", async (c, next) => {
  childContainer
    .bind<string>(TOKENS.DISCORD_APP_ID)
    .toConstantValue(c.env.DISCORD_APP_ID);
  childContainer
    .bind<string>(TOKENS.DISCORD_GUILD_ID)
    .toConstantValue(c.env.DISCORD_GUILD_ID);
  childContainer
    .bind<string>(TOKENS.DISCORD_TOKEN)
    .toConstantValue(c.env.DISCORD_BOT_TOKEN);
  childContainer
    .bind<string>(TOKENS.DISCORD_PUBLIC_KEY)
    .toConstantValue(c.env.DISCORD_PUBLIC_KEY);
  childContainer
    .bind<string>(TOKENS.REMINDER_CHANNEL_ID)
    .toConstantValue(c.env.REMINDER_CHANNEL_ID);

  const db = drizzle(c.env.D1_DATABASE, { schema: schema });
  childContainer
    .bind<DrizzleD1Database<typeof schema>>(TOKENS.D1_DATABASE)
    .toConstantValue(db);

  c.set("container", childContainer);

  await next();
});

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

  const bodyType = bodyDiscriminator(body);

  switch (bodyType) {
    case MODAL_INTERACTION: {
      console.log("[INFO] Modal interaction received");
      const modalHandler = c
        .get("container")
        .get<ModalHandler>(TOKENS.ModalHandler);
      return await modalHandler
        .handleModal(body)
        .then((res) => {
          const response = responseGenerator(res);
          return c.json(response);
        })
        .catch((e) => {
          return c.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `モーダルの処理に失敗しました: ${e.message}`,
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        });
    }
    case MESSAGE_COMPONENT: {
      console.log("[INFO] Message component interaction received");
      const interactiveHandler = c
        .get("container")
        .get<InteractiveHandler>(TOKENS.InteractiveHandler);
      return await interactiveHandler
        .handleInteraction(body)
        .then((res) => {
          const response = responseGenerator(res);
          return c.json(response);
        })
        .catch((e) => {
          return c.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `インタラクションの処理に失敗しました: ${e.message}`,
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        });
    }
    case SLASH_COMMAND: {
      console.log("[INFO] Slash command interaction received");
      const commandHandler = c
        .get("container")
        .get<CommandHandler>(TOKENS.CommandHandler);
      return await commandHandler
        .handleCommand(body)
        .then((res) => {
          const response = responseGenerator(res);
          return c.json(response);
        })
        .catch((e) => {
          return c.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `コマンドの処理に失敗しました: ${e.message}`,
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        });
    }
  }
});

app.patch("/subscribe_command", async (c) => {
  const handler = c
    .get("container")
    .get<SubscribeCommandHandler>(TOKENS.SubscribeCommandHandler);

  await handler.handleSubscribeCommand().catch((err) => {
    return c.text(`サブコマンドの登録に失敗しました: ${err.message}`, 500);
  });

  return c.text("コマンドの登録が完了しました");
});

const responseGenerator = (response?: InteractionResponse) => {
  if (!response) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "システム内部でエラーが発生しました。",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  if (isMessageResponseObj(response)) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: response.content,
        components: response.components,
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  if (isModalResponseObj(response)) {
    return {
      type: InteractionResponseType.MODAL,
      data: {
        custom_id: response.modal.custom_id,
        title: response.modal.title,
        components: response.modal.components,
      },
    };
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: response.content,
      embeds: response.embeds,
      flags: InteractionResponseFlags.EPHEMERAL,
    },
  };
};

export default app;
