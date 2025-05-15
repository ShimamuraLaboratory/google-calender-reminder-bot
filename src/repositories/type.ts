export type Role = {
  roleId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  members?: Member[];
};

export type Schedule = {
  id: string;
  eventId: string | null;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  remindDays: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  members?: Member[];
  roles?: Role[];
  reminds?: Remind[];
};

export type Member = {
  memberId: string;
  userName: string;
  nickName: string | null;
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
