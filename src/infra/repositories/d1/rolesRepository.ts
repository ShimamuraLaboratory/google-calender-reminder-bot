import type { Role } from "@/domain/entities/role";
import { roleMember, roles, scheduleRole } from "@/db/schema";
import BaseRepository from "./baseRepository";
import { eq, inArray } from "drizzle-orm";
import type { IRoleRepository } from "@/domain/repositories/roles";

export class RoleRepository extends BaseRepository implements IRoleRepository {
  async findAll(): Promise<Role[]> {
    const res = await this.db.query.roles.findMany({
      with: {
        roleMembers: {
          with: {
            member: {},
          },
        },
      },
    });

    const formattedRes: Role[] = res.map((role) => {
      const { roleMembers, ...rest } = role;
      return {
        ...rest,
        members: roleMembers.map((roleMember) => ({
          ...roleMember.member,
        })),
      };
    });

    return formattedRes;
  }

  async findById(id: string): Promise<Role | undefined> {
    const res = await this.db.query.roles.findFirst({
      where: (roles, { eq }) => eq(roles.roleId, id),
      with: {
        roleMembers: {
          with: {
            member: {},
          },
        },
      },
    });

    if (!res) {
      return undefined;
    }

    const formattedRes: Role = {
      roleId: res.roleId,
      name: res.name,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt,
      members: res.roleMembers.map((roleMember) => ({
        ...roleMember.member,
      })),
    };

    return formattedRes;
  }

  async findByIds(ids: string[]): Promise<Role[]> {
    const res = await this.db.query.roles.findMany({
      where: (roles, { inArray }) => inArray(roles.roleId, ids),
      with: {
        roleMembers: {
          with: {
            member: {},
          },
        },
      },
    });

    const formattedRes: Role[] = res.map((role) => {
      const { roleMembers, ...rest } = role;
      return {
        ...rest,
        members: roleMembers.map((roleMember) => ({
          ...roleMember.member,
        })),
      };
    });

    return formattedRes;
  }

  async insert(
    data: Omit<Role, "createdAt" | "updatedAt" | "deletedAt">[],
  ): Promise<void> {
    const formattedData = data.map((role) => ({
      ...role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    }));

    await this.db.insert(roles).values(formattedData).execute();
  }

  async update(
    id: string,
    data: Omit<Role, "createdAt" | "updatedAt" | "deletedAt">,
  ): Promise<void> {
    await this.db.update(roles).set(data).where(eq(roles.roleId, id)).execute();
  }

  async delete(id: string[]): Promise<void> {
    await this.db.delete(roles).where(inArray(roles.roleId, id)).execute();

    // NOTE: 中間テーブルの削除
    await this.db
      .delete(roleMember)
      .where(inArray(roleMember.roleId, id))
      .execute();

    await this.db
      .delete(scheduleRole)
      .where(inArray(scheduleRole.roleId, id))
      .execute();
  }
}
