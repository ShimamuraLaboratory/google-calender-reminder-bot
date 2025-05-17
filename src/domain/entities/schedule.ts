import type { Member } from "./member";
import type { Remind } from "./remind";
import type { Role } from "./role";

export type Schedule = {
  id: string;
  eventId?: string;
  title: string;
  description?: string;
  startAt: number;
  endAt: number;
  remindDays?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  members?: Member[];
  roles?: Role[];
  reminds?: Remind[];
};

export const newSchedule = (params: {
  id: string;
  title: string;
  eventId: string | null;
  description: string | null;
  startAt: number;
  endAt: number;
  remindDays: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  members?: Member[] | null;
  roles?: Role[] | null;
  reminds?: Remind[] | null;
}): Schedule => ({
  id: params.id,
  eventId: params.eventId ?? undefined,
  title: params.title,
  description: params.description ?? undefined,
  startAt: params.startAt,
  endAt: params.endAt,
  remindDays: params.remindDays ?? undefined,
  createdAt: params.createdAt,
  updatedAt: params.updatedAt,
  deletedAt: params.deletedAt ?? undefined,
  members: params.members ?? [],
  roles: params.roles ?? [],
  reminds: params.reminds ?? [],
});
