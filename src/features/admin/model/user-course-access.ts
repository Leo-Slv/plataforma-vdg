import type { z } from 'zod';

import type { userCourseAccessSchema } from '@/features/admin/schemas/user-course-access.schema';

type UserCourseAccess = z.infer<typeof userCourseAccessSchema>;

export type { UserCourseAccess };
