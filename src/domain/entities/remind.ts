import type { Member } from "./member";
import type { Schedule } from "./schedule";

export type Remind = {
  id: string;
  scheduleId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  schedule?: Schedule;
  members?: Member[];
};
