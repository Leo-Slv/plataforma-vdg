import { apiFetch } from '@/lib/http/api-client';
import { userSchema } from '@/features/admin/schemas/user.schema';
import type { User } from '@/features/admin/model/user';

type UpdateUserPayload = {
	name: string;
	email: string;
	active: boolean;
};

async function updateUser(
	userId: string,
	payload: UpdateUserPayload,
): Promise<User> {
	const data = await apiFetch(`/api/users/${userId}`, {
		method: 'PUT',
		body: payload,
	});
	return userSchema.parse(data);
}

export { updateUser };
export type { UpdateUserPayload };
