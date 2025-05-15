import type { Role } from "./type";

export interface IRoleRepository {
  findAll(): Promise<Role[]>;
  findById(id: string): Promise<Role | undefined>;
  findByIds(ids: string[]): Promise<Role[]>;
  insert(
    data: Omit<Role, "createdAt" | "updatedAt" | "deletedAt">[],
  ): Promise<void>;
  update(
    id: string,
    data: Omit<Role, "createdAt" | "updatedAt" | "deletedAt">,
  ): Promise<void>;
  delete(id: string[]): Promise<void>;
}
