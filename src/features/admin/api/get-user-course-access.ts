import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { userCourseAccessSchema } from '@/features/admin/schemas/user-course-access.schema';
import type { UserCourseAccess } from '@/features/admin/model/user-course-access';

async function getUserCourseAccess(
	userId: string,
): Promise<UserCourseAccess[]> {
	const data = await apiFetch(`/api/access/user-course/${userId}`);
	return z.array(userCourseAccessSchema).parse(data);
}

export { getUserCourseAccess };
