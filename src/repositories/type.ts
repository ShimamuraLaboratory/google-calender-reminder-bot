export type Role = {
	roleId: string;
	name: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

export type Member = {
	memberId: string;
	lastName: string;
	firstName: string;
	userName: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};
