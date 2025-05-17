import type { Role } from "./role";

export type Member = {
  memberId: string;
  userName: string;
  nickName: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  roles?: Role[];
};
