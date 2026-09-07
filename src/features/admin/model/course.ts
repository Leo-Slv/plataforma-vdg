import type { z } from 'zod';

import type { courseSchema } from '@/features/admin/schemas/course.schema';

type Course = z.infer<typeof courseSchema>;

export type { Course };
