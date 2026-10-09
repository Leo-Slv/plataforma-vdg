import { apiFetch } from '@/lib/http/api-client';

async function revokeUserCourseAccess(
	userId: string,
	courseId: string,
): Promise<void> {
	await apiFetch(`/api/access/user-course/${userId}/${courseId}`, {
		method: 'DELETE',
	});
}

export { revokeUserCourseAccess };
