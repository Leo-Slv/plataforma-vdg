import { apiFetch } from '@/lib/http/api-client';
import { accessRequestSchema } from '@/features/catalog/schemas/access-request.schema';
import type { AccessRequest } from '@/features/catalog/model/access-request';

async function requestCourseAccess(courseId: string): Promise<AccessRequest> {
	const data = await apiFetch('/api/access/requests', {
		method: 'POST',
		body: { courseId },
	});
	return accessRequestSchema.parse(data);
}

export { requestCourseAccess };
