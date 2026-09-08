import { apiFetch } from '@/lib/http/api-client';
import { pagedUsersSchema } from '@/features/admin/schemas/user.schema';
import type { PagedUsers } from '@/features/admin/model/user';

async function getUsers(
	page: number,
	pageSize: number,
	search: string,
): Promise<PagedUsers> {
	const params = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize),
	});
	if (search.trim().length > 0) {
		params.set('search', search.trim());
	}

	const data = await apiFetch(`/api/users?${params.toString()}`);
	return pagedUsersSchema.parse(data);
}

export { getUsers };
