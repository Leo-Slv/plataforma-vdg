import { apiFetch } from '@/lib/http/api-client';
import { accessRequestSchema } from '@/features/admin/schemas/access-request.schema';
import type { AccessRequest } from '@/features/admin/model/access-request';

async function grantCourseAccess(
	userId: string,
	courseId: string,
): Promise<AccessRequest> {
	const data = await apiFetch('/api/access/requests/grant', {
		method: 'POST',
		body: { userId, courseId },
	});
	return accessRequestSchema.parse(data);
}

export { grantCourseAccess };
