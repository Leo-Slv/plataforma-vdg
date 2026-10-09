import type { AccessRequest } from '@/features/catalog/model/access-request';

/**
 * Status of the user's most recent access request for a course
 * ("Pending" | "Approved" | "Rejected"), or null if they never asked.
 */
function latestRequestStatus(
	requests: AccessRequest[] | undefined,
	courseId: string,
): string | null {
	const latest = (requests ?? [])
		.filter((request) => request.courseId === courseId)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

	return latest?.status ?? null;
}

export { latestRequestStatus };
