import { relations } from "drizzle-orm";
import { sqliteTable as table, text, integer } from "drizzle-orm/sqlite-core";

export const roles = table("roles", {
  roleId: text("role_id").primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const members = table("members", {
  memberId: text("member_id").primaryKey(),
  userName: text("user_name").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
});

export const roleMember = table("role_member", {
  roleId: text("role_id")
    .notNull()
    .references(() => roles.roleId, { onDelete: "cascade" }),
  memberId: text("member_id")
    .notNull()
    .references(() => members.memberId, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const roleMemberRelations = relations(roleMember, ({ one }) => ({
  role: one(roles, {
    fields: [roleMember.roleId],
    references: [roles.roleId],
  }),
  member: one(members, {
    fields: [roleMember.memberId],
    references: [members.memberId],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  roleMembers: many(roleMember),
  scheduleRoles: many(scheduleRole),
}));
export const membersRelations = relations(members, ({ many }) => ({
  roleMembers: many(roleMember),
  scheduleMembers: many(scheduleMember),
}));

export const reminds = table("reminds", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  scheduleId: text("schedule_id")
    .notNull()
    .references(() => schedules.id, { onDelete: "cascade" }),
  sendedAt: text("sended_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
});

export const remindMember = table("remind_member", {
  remindId: text("remind_id")
    .notNull()
    .references(() => reminds.id, { onDelete: "cascade" }),
  memberId: text("member_id")
    .notNull()
    .references(() => members.memberId, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const remindMemberRelations = relations(remindMember, ({ one }) => ({
  remind: one(reminds, {
    fields: [remindMember.remindId],
    references: [reminds.id],
  }),
  member: one(members, {
    fields: [remindMember.memberId],
    references: [members.memberId],
  }),
}));

export const remindsRelations = relations(reminds, ({ many, one }) => ({
  remindMembers: many(remindMember),
  schedule: one(schedules, {
    fields: [reminds.scheduleId],
    references: [schedules.id],
  }),
}));

export const schedules = table("schedules", {
  id: text("id").primaryKey(),
  eventId: text("event_id"),
  title: text("title").notNull(),
  description: text("description"),
  startAt: text("start_at").notNull(),
  endAt: text("end_at").notNull(),
  remindDays: integer("remind_days"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
});

export const scheduleMember = table("schedule_member", {
  scheduleId: text("schedule_id")
    .notNull()
    .references(() => schedules.id, { onDelete: "cascade" }),
  memberId: text("member_id")
    .notNull()
    .references(() => members.memberId, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const scheduleMemberRelations = relations(scheduleMember, ({ one }) => ({
  schedule: one(schedules, {
    fields: [scheduleMember.scheduleId],
    references: [schedules.id],
  }),
  member: one(members, {
    fields: [scheduleMember.memberId],
    references: [members.memberId],
  }),
}));

export const scheduleRole = table("schedule_role", {
  scheduleId: text("schedule_id")
    .notNull()
    .references(() => schedules.id, { onDelete: "cascade" }),
  roleId: text("role_id")
    .notNull()
    .references(() => roles.roleId, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
export const scheduleRoleRelations = relations(scheduleRole, ({ one }) => ({
  schedule: one(schedules, {
    fields: [scheduleRole.scheduleId],
    references: [schedules.id],
  }),
  role: one(roles, {
    fields: [scheduleRole.roleId],
    references: [roles.roleId],
  }),
}));

export const schedulesRelations = relations(schedules, ({ many }) => ({
  scheduleMembers: many(scheduleMember),
  scheduleRoles: many(scheduleRole),
  reminds: many(reminds),
}));
