import type { Schedule } from "@/domain/entities/schedule";
import { newSchedule } from "@/domain/entities/schedule";
import { scheduleMember, scheduleRole, schedules } from "@/db/schema";
import BaseRepository from "./baseRepository";
import { and, eq, inArray, gte, lte } from "drizzle-orm";
import type { IScheduleRepository } from "@/domain/repositories/schedules";

export class ScheduleRepository
  extends BaseRepository
  implements IScheduleRepository
{
  async findAll(params: {
    startAt?: number;
    endAt?: number;
  }): Promise<Schedule[]> {
    const { startAt, endAt } = params;

    const res = await this.db.query.schedules.findMany({
      where: (schedules, { and, isNull }) =>
        and(
          isNull(schedules.deletedAt),
          // NOTE: startAt < schedules.startAt
          startAt ? gte(schedules.startAt, startAt) : undefined,
          // NOTE: endAt > schedules.endAt
          endAt ? lte(schedules.endAt, endAt) : undefined,
        ),
      with: {
        reminds: {
          where: (reminds, { isNull }) => isNull(reminds.deletedAt),
        },
        scheduleMembers: {
          with: {
            member: {},
          },
        },
        scheduleRoles: {
          with: {
            role: {},
          },
        },
      },
      orderBy: (schedules, { asc }) => [asc(schedules.startAt)],
    });

    const formattedRes: Schedule[] = res.map((schedule) => {
      const { scheduleRoles, scheduleMembers, ...rest } = schedule;
      return newSchedule({
        ...rest,
        members: scheduleMembers.map((scheduleMember) => ({
          ...scheduleMember.member,
        })),
        roles: scheduleRoles.map((scheduleRole) => scheduleRole.role),
      });
    });

    return formattedRes;
  }

  async findById(id: string): Promise<Schedule | undefined> {
    const res = await this.db.query.schedules.findFirst({
      where: (schedules, { and, eq, isNull }) =>
        and(eq(schedules.id, id), isNull(schedules.deletedAt)),
      with: {
        reminds: {
          where: (reminds, { isNull }) => isNull(reminds.deletedAt),
        },
        scheduleMembers: {
          with: {
            member: {},
          },
        },
        scheduleRoles: {
          with: {
            role: {},
          },
        },
      },
    });

    if (!res) {
      return undefined;
    }

    const formattedRes: Schedule = newSchedule({
      ...res,
      members: res.scheduleMembers.map((scheduleMember) => ({
        ...scheduleMember.member,
      })),
      roles: res.scheduleRoles.map((scheduleRole) => scheduleRole.role),
    });

    return formattedRes;
  }

  async findByEventId(id: string): Promise<Schedule | undefined> {
    const res = await this.db.query.schedules.findFirst({
      where: (schedules, { and, isNull, eq }) =>
        and(eq(schedules.eventId, id), isNull(schedules.deletedAt)),
      with: {
        reminds: {
          where: (reminds, { isNull }) => isNull(reminds.deletedAt),
        },
        scheduleMembers: {
          with: {
            member: {},
          },
        },
        scheduleRoles: {
          with: {
            role: {},
          },
        },
      },
    });

    if (!res) {
      return undefined;
    }

    const formattedRes: Schedule = newSchedule({
      ...res,
      members: res.scheduleMembers.map((scheduleMember) => ({
        ...scheduleMember.member,
      })),
      roles: res.scheduleRoles.map((scheduleRole) => scheduleRole.role),
    });

    return formattedRes;
  }

  async findByRoleIds(roleIds: string[]): Promise<Schedule[]> {
    const res = await this.db.query.schedules.findMany({
      where: (schedules, { isNull }) => isNull(schedules.deletedAt),
      with: {
        reminds: {
          where: (reminds, { isNull }) => isNull(reminds.deletedAt),
        },
        scheduleMembers: {
          with: {
            member: {},
          },
        },
        scheduleRoles: {
          where: (roles, { inArray }) => inArray(roles.roleId, roleIds),
          with: {
            role: {},
          },
        },
      },
      orderBy: (schedules, { asc }) => [asc(schedules.startAt)],
    });

    const formattedRes: Schedule[] = res.map((schedule) => {
      const { scheduleRoles, scheduleMembers, ...rest } = schedule;
      return newSchedule({
        ...rest,
        members: scheduleMembers.map((scheduleMember) => ({
          ...scheduleMember.member,
        })),
        roles: scheduleRoles.map((scheduleRole) => scheduleRole.role),
      });
    });

    return formattedRes;
  }

  async insert(
    data: Omit<Schedule, "createdAt" | "updatedAt" | "deletedAt">,
    memberIds?: string[],
    roleIds?: string[],
  ): Promise<void> {
    const formattedData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await this.db
      .insert(schedules)
      .values(formattedData)
      .execute()
      .catch((e) => {
        throw new Error(e);
      });

    // NOTE: roleとスケジュールを紐づけ
    if (roleIds && roleIds.length > 0) {
      const formattedScheduleRole = roleIds.map((roleId) => ({
        roleId,
        scheduleId: formattedData.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      await this.db
        .insert(scheduleRole)
        .values(formattedScheduleRole)
        .execute()
        .catch((e) => {
          throw new Error(e);
        });
    }

    // NOTE: ユーザーとスケジュールを紐づけ
    if (memberIds && memberIds.length > 0) {
      const formattedScheduleMember = memberIds.map((memberId) => ({
        memberId,
        scheduleId: formattedData.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      await this.db
        .insert(scheduleMember)
        .values(formattedScheduleMember)
        .execute()
        .catch((e) => {
          throw new Error(e);
        });
    }
  }

  async update(
    id: string,
    data: Omit<Schedule, "createdAt" | "updatedAt" | "deletedAt">,
    memberIds?: string[],
    roleIds?: string[],
  ): Promise<void> {
    await this.db
      .update(schedules)
      .set(data)
      .where(eq(schedules.id, id))
      .execute();

    // NOTE: リレーションの更新
    if (roleIds) {
      const oldScheduleRoles = await this.db.query.scheduleRole.findMany({
        where: (scheduleRole, { eq }) => eq(scheduleRole.scheduleId, id),
      });
      const oldRoleIds = oldScheduleRoles.map(
        (scheduleRole) => scheduleRole.roleId,
      );
      const newRoleIdsSet = new Set(roleIds);
      const oldRoleIdsSet = new Set(oldRoleIds);
      const toInsert = roleIds.filter((roleId) => !oldRoleIdsSet.has(roleId));
      const toDelete = oldRoleIds.filter(
        (roleId) => !newRoleIdsSet.has(roleId),
      );
      const formattedScheduleRole = toInsert.map((roleId) => ({
        roleId,
        scheduleId: id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      if (toDelete.length > 0) {
        await this.db
          .delete(scheduleRole)
          .where(
            and(
              eq(scheduleRole.scheduleId, id),
              inArray(scheduleRole.roleId, toDelete),
            ),
          )
          .execute();
      }

      if (formattedScheduleRole.length > 0) {
        await this.db
          .insert(scheduleRole)
          .values(formattedScheduleRole)
          .execute();
      }
    }

    if (memberIds) {
      const oldScheduleMembers = await this.db.query.scheduleMember.findMany({
        where: (scheduleMember, { eq }) => eq(scheduleMember.scheduleId, id),
      });
      const oldMemberIds = oldScheduleMembers.map(
        (scheduleMember) => scheduleMember.memberId,
      );
      const newMemberIdsSet = new Set(memberIds);
      const oldMemberIdsSet = new Set(oldMemberIds);
      const toInsert = memberIds.filter(
        (memberId) => !oldMemberIdsSet.has(memberId),
      );
      const toDelete = oldMemberIds.filter(
        (memberId) => !newMemberIdsSet.has(memberId),
      );
      const formattedScheduleMember = toInsert.map((memberId) => ({
        memberId,
        scheduleId: id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      if (formattedScheduleMember.length > 0) {
        await this.db
          .insert(scheduleMember)
          .values(formattedScheduleMember)
          .execute();
      }

      if (toDelete.length > 0) {
        await this.db
          .delete(scheduleMember)
          .where(
            and(
              eq(scheduleMember.scheduleId, id),
              inArray(scheduleMember.memberId, toDelete),
            ),
          )
          .execute();
      }
    }
  }

  async delete(id: string): Promise<void> {
    await this.db
      .update(schedules)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(schedules.id, id))
      .execute();

    // NOTE: 中間テーブルの削除
    await this.db
      .delete(scheduleRole)
      .where(eq(scheduleRole.scheduleId, id))
      .execute();

    await this.db
      .delete(scheduleMember)
      .where(eq(scheduleMember.scheduleId, id))
      .execute();
  }
}
