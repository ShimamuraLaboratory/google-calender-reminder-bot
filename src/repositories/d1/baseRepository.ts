import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "@/db/schema";

export default class BaseRepository {
  public db: DrizzleD1Database<typeof schema>;

  constructor(db: DrizzleD1Database<typeof schema>) {
    this.db = db;
  }
}
