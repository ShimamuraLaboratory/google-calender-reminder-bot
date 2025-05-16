import type { Schedule } from "./type";

export interface IScheduleRepository {
  findAll(params: {
    startAt?: number;
    endAt?: number;
  }): Promise<Schedule[]>;
  findByEventId(id: string): Promise<Schedule | undefined>;
  findByRoleIds(roleIds: string[]): Promise<Schedule[]>;
  insert(
    data: Omit<Schedule, "createdAt" | "updatedAt" | "deletedAt">,
    memberIds?: string[],
    roleIds?: string[],
  ): Promise<void>;
  update(
    id: string,
    data: Omit<Schedule, "createdAt" | "updatedAt" | "deletedAt">,
    memberIds?: string[],
    roleIds?: string[],
  ): Promise<void>;
  delete(id: string): Promise<void>;
}
