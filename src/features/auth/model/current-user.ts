type CurrentUser = {
	userId: string;
	name: string;
	email: string;
	active: boolean;
	emailVerifiedAt: string | null;
	phone: string | null;
	avatarUrl: string | null;
	roles: string[];
};

export type { CurrentUser };
