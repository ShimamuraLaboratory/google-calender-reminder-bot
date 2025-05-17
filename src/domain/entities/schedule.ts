import type { Member } from "./member";
import type { Remind } from "./remind";
import type { Role } from "./role";

export type Schedule = {
  id: string;
  eventId: string | null;
  title: string;
  description: string | null;
  startAt: number;
  endAt: number;
  remindDays: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  members?: Member[];
  roles?: Role[];
  reminds?: Remind[];
};
