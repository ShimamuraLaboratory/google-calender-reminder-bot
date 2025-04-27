import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { DiscordClient } from "./client/discord";
import { InteractionResponseType, verifyKey } from "discord-interactions";

export type Bindings = {
	DISCORD_PUBLIC_KEY: string;
	DISCORD_APP_ID: string;
	DISCORD_BOT_TOKEN: string;
	DISCORD_PERMISSION_ID: string;
	D1Database: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

export const verifyMiddleware = createMiddleware<{ Bindings: Bindings }>(
	async (c, next) => {
		const signature = c.req.header("X-Signature-Ed25519");
		const timestamp = c.req.header("X-Signature-Timestamp");
		const rawBody = await c.req.raw.clone().text();

		const isValid =
			signature &&
			timestamp &&
			verifyKey(rawBody, signature, timestamp, c.env.DISCORD_PUBLIC_KEY);

		if (!isValid) {
			return c.text("Invalid request signature", 401);
		}

		const body = JSON.parse(rawBody);
		if (body.type === InteractionResponseType.PONG) {
			return c.json({ type: InteractionResponseType.PONG });
		}

		return await next();
	},
);

app.get("/", verifyMiddleware, async (c) => {
	return c.text("Hello Hono!");
});

export default app;
