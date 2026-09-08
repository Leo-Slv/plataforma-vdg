import type { z } from 'zod';

import type { courseModuleSchema } from '@/features/admin/schemas/course-module.schema';

type CourseModule = z.infer<typeof courseModuleSchema>;

export type { CourseModule };
