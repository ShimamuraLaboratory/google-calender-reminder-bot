import { relations } from "drizzle-orm";
import {
  sqliteTable as table,
  text,
  integer,
  int,
} from "drizzle-orm/sqlite-core";

export const roles = table("roles", {
  roleId: text("role_id").primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const members = table("members", {
  memberId: text("member_id").primaryKey(),
  userName: text("user_name").notNull(),
  nickName: text("nick_name"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
});

export const coretimes = table("coretimes", {
  id: text("id").primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => members.memberId, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  startAt: text("start_at").notNull(),
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
  coretimes: many(coretimes),
}));

export const coretimesRelations = relations(coretimes, ({ one, many }) => ({
  member: one(members, {
    fields: [coretimes.memberId],
    references: [members.memberId],
  }),
  scheduleCoretimes: many(scheduleCoretime),
}))

export const reminds = table("reminds", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  scheduleId: text("schedule_id")
    .notNull()
    .references(() => schedules.id, { onDelete: "cascade" }),
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
  startAt: int("start_at").notNull(),
  endAt: int("end_at").notNull(),
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

export const scheduleCoretime = table("schedule_coretime", {
  scheduleId: text("schedule_id")
    .notNull()
    .references(() => schedules.id, { onDelete: "cascade" }),
  coretimeId: text("coretime_id")
    .notNull()
    .references(() => coretimes.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})

export const scheduleCoretimeRelations = relations(scheduleCoretime, ({ one }) => ({
  schedule: one(schedules, {
    fields: [scheduleCoretime.scheduleId],
    references: [schedules.id],
  }),
  coretime: one(coretimes, {
    fields: [scheduleCoretime.coretimeId],
    references: [coretimes.id],
  })
}))

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
  scheduleCoretimes: many(scheduleCoretime),
}));
