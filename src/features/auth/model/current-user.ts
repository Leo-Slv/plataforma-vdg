type CurrentUser = {
	userId: string;
	name: string;
	email: string;
	active: boolean;
	emailVerifiedAt: string | null;
	roles: string[];
};

export type { CurrentUser };
