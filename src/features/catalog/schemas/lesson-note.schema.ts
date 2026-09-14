import { z } from 'zod';

const lessonNoteSchema = z.object({
	content: z.string(),
});

export { lessonNoteSchema };
