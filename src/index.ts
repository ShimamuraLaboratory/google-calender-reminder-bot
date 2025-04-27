import { Hono } from "hono";

export type Bindings = {
	D1Database: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

export default app;
