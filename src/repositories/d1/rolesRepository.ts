import type { Role } from "./type";
import { roles } from "@/db/schema";
import BaseRepository from "./baseRepository";
import { eq } from "drizzle-orm";

// TODO: any型は排除する (2025/04/29)
export interface IRoleRepository {
	findById(id: string): Promise<Role | undefined>;
	findByIds(ids: string[]): Promise<Role[]>;
	insert(
		data: Omit<Role, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void>;
	update(
		id: string,
		data: Omit<Role, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void>;
	delete(id: string): Promise<void>;
}

export class RoleRepository extends BaseRepository implements IRoleRepository {
	async findById(id: string): Promise<Role | undefined> {
		const res = await this.db.query.roles.findFirst({
			where: (roles, { eq }) => eq(roles.roleId, id),
		});
		return res;
	}

	async findByIds(ids: string[]): Promise<Role[]> {
		const res = await this.db.query.roles.findMany({
			where: (roles, { inArray }) => inArray(roles.roleId, ids),
		});
		return res;
	}

	async insert(
		data: Omit<Role, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void> {
		const formattedData = {
			...data,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
		};

		await this.db.insert(roles).values(formattedData).execute();
	}

	async update(
		id: string,
		data: Omit<Role, "createdAt" | "updatedAt" | "deletedAt">,
	): Promise<void> {
		await this.db.update(roles).set(data).where(eq(roles.roleId, id)).execute();
	}

	async delete(id: string): Promise<void> {
		// NOTE: 論理削除
		await this.db
			.update(roles)
			.set({ deletedAt: new Date().toISOString() })
			.where(eq(roles.roleId, id))
			.execute();
	}
}
