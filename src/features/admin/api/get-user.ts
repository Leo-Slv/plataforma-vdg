import { apiFetch } from '@/lib/http/api-client';
import { userSchema } from '@/features/admin/schemas/user.schema';
import type { User } from '@/features/admin/model/user';

async function getUser(userId: string): Promise<User> {
	const data = await apiFetch(`/api/users/${userId}`);
	return userSchema.parse(data);
}

export { getUser };
