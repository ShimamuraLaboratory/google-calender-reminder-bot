import type { Member } from "./member";

export type Role = {
  roleId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  members?: Member[];
};
