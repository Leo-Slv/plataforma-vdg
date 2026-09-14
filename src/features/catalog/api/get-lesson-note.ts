import { apiFetch } from '@/lib/http/api-client';
import { lessonNoteSchema } from '@/features/catalog/schemas/lesson-note.schema';
import type { LessonNote } from '@/features/catalog/model/lesson-note';

async function getLessonNote(lessonId: string): Promise<LessonNote> {
	const data = await apiFetch(`/api/notes/lessons/${lessonId}`);
	return lessonNoteSchema.parse(data);
}

export { getLessonNote };
