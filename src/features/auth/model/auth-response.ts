type AuthTokenResponse = {
	accessToken: string;
	refreshToken?: string | null;
	expiresAt: string;
};

type AuthResponse = {
	userId: string;
	name: string;
	email: string;
	roles: string[];
	token: AuthTokenResponse;
};

export type { AuthResponse, AuthTokenResponse };
