import type { z } from 'zod';

import type { lessonSchema } from '@/features/admin/schemas/lesson.schema';

type Lesson = z.infer<typeof lessonSchema>;

export type { Lesson };
