import { apiFetch } from '@/lib/http/api-client';
import { userSchema } from '@/features/admin/schemas/user.schema';
import type { User } from '@/features/admin/model/user';

type CreateUserPayload = {
	name: string;
	email: string;
	password: string;
};

async function createUser(payload: CreateUserPayload): Promise<User> {
	const data = await apiFetch('/api/users', {
		method: 'POST',
		body: payload,
	});
	return userSchema.parse(data);
}

export { createUser };
export type { CreateUserPayload };
