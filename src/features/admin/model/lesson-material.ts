import type { z } from 'zod';

import type { lessonMaterialSchema } from '@/features/admin/schemas/lesson-material.schema';

type LessonMaterial = z.infer<typeof lessonMaterialSchema>;

export type { LessonMaterial };
