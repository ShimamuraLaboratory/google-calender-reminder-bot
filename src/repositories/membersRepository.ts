import BaseRepository from "./baseRepository";
import type { Member } from "./type";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface IMemberRepository {
	findById(id: string): Promise<Member | undefined>;
	findByIds(ids: string[]): Promise<Member[]>;
	insert(
		data: Omit<Member, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void>;
	update(
		id: string,
		data: Omit<Member, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void>;
	delete(id: string): Promise<void>;
}

export class MemberRepository
	extends BaseRepository
	implements IMemberRepository
{
	async findById(id: string): Promise<Member | undefined> {
		const res = await this.db.query.members.findFirst({
			where: (members, { eq }) => eq(members.memberId, id),
		});
		return res;
	}

	async findByIds(ids: string[]): Promise<Member[]> {
		const res = await this.db.query.members.findMany({
			where: (members, { inArray }) => inArray(members.memberId, ids),
		});
		return res;
	}

	async insert(
		data: Omit<Member, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void> {
		const formattedData = {
			...data,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
		};

		await this.db.insert(members).values(formattedData).execute();
	}

	async update(
		id: string,
		data: Omit<Member, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void> {
		await this.db
			.update(members)
			.set(data)
			.where(eq(members.memberId, id))
			.execute();
	}

	async delete(id: string): Promise<void> {
		// NOTE: 論理削除
		await this.db
			.update(members)
			.set({ deletedAt: new Date().toISOString() })
			.where(eq(members.memberId, id))
			.execute();
	}
}
