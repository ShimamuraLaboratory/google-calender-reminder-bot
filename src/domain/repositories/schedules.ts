import type { Schedule } from "@/domain/entities/schedule";

export interface IScheduleRepository {
  findAll(params: {
    startAt?: number;
    endAt?: number;
  }): Promise<Schedule[]>;
  findById(id: string): Promise<Schedule | undefined>;
  findByEventId(id: string): Promise<Schedule | undefined>;
  findByRoleIds(roleIds: string[]): Promise<Schedule[]>;
  findAbleToRemind(now: number): Promise<Schedule[]>;
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
