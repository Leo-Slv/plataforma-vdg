import type { z } from 'zod';

import type { lessonQuestionSchema } from '@/features/admin/schemas/lesson-question.schema';

type LessonQuestion = z.infer<typeof lessonQuestionSchema>;

export type { LessonQuestion };
