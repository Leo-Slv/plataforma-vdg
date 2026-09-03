import { apiFetch } from '@/lib/http/api-client';
import { authResponseSchema } from '@/features/auth/schemas/auth-response.schema';
import type { AuthResponse } from '@/features/auth/model/auth-response';

type LoginPayload = {
	email: string;
	password: string;
};

async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
	const data = await apiFetch<unknown>('/api/auth/login', {
		method: 'POST',
		body: payload,
	});

	return authResponseSchema.parse(data);
}

export { loginUser };
export type { LoginPayload };
