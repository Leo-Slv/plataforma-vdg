import { apiFetch } from '@/lib/http/api-client';
import { authResponseSchema } from '@/features/auth/schemas/auth-response.schema';
import type { AuthResponse } from '@/features/auth/model/auth-response';

type RegisterPayload = {
	name: string;
	email: string;
	password: string;
	captchaToken: string;
};

async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
	const data = await apiFetch<unknown>('/api/auth/register', {
		method: 'POST',
		body: payload,
	});

	return authResponseSchema.parse(data);
}

export { registerUser };
export type { RegisterPayload };
