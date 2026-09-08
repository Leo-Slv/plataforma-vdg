import { LessonEditorPage } from '@/features/admin/components/lesson-editor-page';

export default async function LessonEdit({
	params,
}: PageProps<'/admin/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/edit'>) {
	const { courseId, moduleId, lessonId } = await params;
	return (
		<LessonEditorPage
			courseId={courseId}
			moduleId={moduleId}
			lessonId={lessonId}
		/>
	);
}
