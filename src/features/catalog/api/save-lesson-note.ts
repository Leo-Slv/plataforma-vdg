import { apiFetch } from '@/lib/http/api-client';
import { lessonNoteSchema } from '@/features/catalog/schemas/lesson-note.schema';
import type { LessonNote } from '@/features/catalog/model/lesson-note';

type SaveLessonNoteInput = {
	lessonId: string;
	content: string;
};

async function saveLessonNote(input: SaveLessonNoteInput): Promise<LessonNote> {
	const data = await apiFetch(`/api/notes/lessons/${input.lessonId}`, {
		method: 'PUT',
		body: { content: input.content },
	});
	return lessonNoteSchema.parse(data);
}

export { saveLessonNote };
