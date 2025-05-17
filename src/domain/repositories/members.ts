import type { Member } from "@/domain/entities/member";

export interface IMemberRepository {
  findAll(): Promise<Member[]>;
  findById(id: string): Promise<Member | undefined>;
  findByIds(ids: string[]): Promise<Member[]>;
  findByRoles(roleId: string[]): Promise<Member[]>;
  insert(data: {
    memberId: string;
    userName: string;
    nickName?: string | null;
    roles?: string[];
  }): Promise<void>;
  bulkInsert(
    data: {
      memberId: string;
      userName: string;
      nickName?: string | null;
      roles?: string[];
    }[],
  ): Promise<void>;
  update(data: {
    memberId: string;
    userName: string;
    nickName?: string | null;
    roles?: string[];
  }): Promise<void>;
  bulkUpdate(
    data: {
      memberId: string;
      userName: string;
      nickName?: string | null;
      roles?: string[];
    }[],
  ): Promise<void>;
  delete(id: string[]): Promise<void>;
}
