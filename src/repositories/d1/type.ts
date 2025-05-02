export type Role = {
  roleId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  members?: Member[];
};

export type Schedule = {
  id: string;
  calendarId: string | null;
  eventId: string | null;
  title: string;
  distribution: string;
  startAt: string;
  endAt: string;
  remindDays: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  members?: Member[];
  roles?: Role[];
  reminds?: Remind[];
};

export type Member = {
  memberId: string;
  lastName: string;
  firstName: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  roles?: Role[];
};

export type Remind = {
  id: string;
  scheduleId: string;
  text: string;
  sendedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  schedule?: Schedule;
  members?: Member[];
};
