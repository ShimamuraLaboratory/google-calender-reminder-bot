import type { Remind } from "@/domain/entities/remind";

export interface IRemindRepository {
  findById(id: string): Promise<Remind | undefined>;
  findByIds(ids: string[]): Promise<Remind[]>;
  insert(
    params: {
      data: Omit<Remind, "createdAt" | "updatedAt" | "deletedAt">;
      memberIds?: string[];
      roleIds?: string[];
    }[],
  ): Promise<void>;
  delete(id: string): Promise<void>;
}
