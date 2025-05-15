import type { Remind } from "./type";

export interface IRemindRepository {
  findById(id: string): Promise<Remind | undefined>;
  findByIds(ids: string[]): Promise<Remind[]>;
  insert(
    data: Omit<Remind, "createdAt" | "updatedAt" | "deletedAt">,
    memberIds?: string[],
  ): Promise<void>;
  update(
    id: string,
    data: Omit<Remind, "createdAt" | "updatedAt" | "deletedAt">,
  ): Promise<void>;
  delete(id: string): Promise<void>;
}
