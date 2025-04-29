import type { Schedule } from "./type";
import { schedules } from "@/db/schema";
import BaseRepository from "./baseRepository";
import { eq } from "drizzle-orm";

export interface IScheduleRepository {
	findByEventId(id: string): Promise<Schedule | undefined>;
	insert(
		data: Omit<Schedule, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void>;
	update(
		id: string,
		data: Omit<Schedule, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void>;
	delete(id: string): Promise<void>;
}

export class ScheduleRepository
	extends BaseRepository
	implements IScheduleRepository
{
	async findByEventId(id: string): Promise<Schedule | undefined> {
		const res = await this.db.query.schedules.findFirst({
			where: (schedules, { eq }) => eq(schedules.eventId, id),
		});
		return res;
	}

	async insert(
		data: Omit<Schedule, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void> {
		const formattedData = {
			...data,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
		};

		await this.db.insert(schedules).values(formattedData).execute();
	}

	async update(
		id: string,
		data: Omit<Schedule, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void> {
		await this.db
			.update(schedules)
			.set(data)
			.where(eq(schedules.id, id))
			.execute();
	}

	async delete(id: string): Promise<void> {
		// NOTE: 論理削除
		await this.db
			.update(schedules)
			.set({ deletedAt: new Date().toISOString() })
			.where(eq(schedules.id, id))
			.execute();
	}
}
