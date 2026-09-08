import { apiFetch } from '@/lib/http/api-client';
import { currentUserSchema } from '@/features/auth/schemas/current-user.schema';
import type { CurrentUser } from '@/features/auth/model/current-user';

async function getCurrentUser(): Promise<CurrentUser> {
	const data = await apiFetch<unknown>('/api/auth/me');
	return currentUserSchema.parse(data);
}

export { getCurrentUser };
