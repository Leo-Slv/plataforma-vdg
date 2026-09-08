import { z } from 'zod';

import { lessonSchema } from '@/features/admin/schemas/lesson.schema';

const courseModuleSchema = z.object({
	id: z.string(),
	courseId: z.string(),
	title: z.string(),
	description: z.string(),
	displayOrder: z.number(),
	published: z.boolean(),
	lessons: z.array(lessonSchema),
});

export { courseModuleSchema };
