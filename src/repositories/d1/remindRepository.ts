import type { Remind } from "./type";
import { reminds } from "@/db/schema";
import BaseRepository from "./baseRepository";
import { eq } from "drizzle-orm";

export interface IRemindRepository {
	findById(id: string): Promise<Remind | undefined>;
	findByIds(ids: string[]): Promise<Remind[]>;
	insert(
		data: Omit<Remind, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void>;
	update(
		id: string,
		data: Omit<Remind, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void>;
	delete(id: string): Promise<void>;
}

export class RemindRepository
	extends BaseRepository
	implements IRemindRepository
{
	async findById(id: string): Promise<Remind | undefined> {
		const res = await this.db.query.reminds.findFirst({
			where: (reminds, { eq }) => eq(reminds.id, id),
		});
		return res;
	}

	async findByIds(ids: string[]): Promise<Remind[]> {
		const res = await this.db.query.reminds.findMany({
			where: (reminds, { inArray }) => inArray(reminds.id, ids),
		});
		return res;
	}

	async insert(
		data: Omit<Remind, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void> {
		const formattedData = {
			...data,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
		};

		await this.db.insert(reminds).values(formattedData).execute();
	}
	async update(
		id: string,
		data: Omit<Remind, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void> {
		await this.db.update(reminds).set(data).where(eq(reminds.id, id)).execute();
	}
	async delete(id: string): Promise<void> {
		await this.db
			.update(reminds)
			.set({ deletedAt: new Date().toISOString() })
			.where(eq(reminds.id, id))
			.execute();
	}
}
