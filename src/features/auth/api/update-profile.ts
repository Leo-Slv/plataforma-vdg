import { apiFetch } from '@/lib/http/api-client';
import { currentUserSchema } from '@/features/auth/schemas/current-user.schema';
import type { CurrentUser } from '@/features/auth/model/current-user';

type UpdateProfilePayload = {
	name: string;
	phone: string | null;
	avatarUrl: string | null;
};

async function updateProfile(
	payload: UpdateProfilePayload,
): Promise<CurrentUser> {
	const data = await apiFetch('/api/auth/me', { method: 'PUT', body: payload });
	return currentUserSchema.parse(data);
}

export { updateProfile };
export type { UpdateProfilePayload };
