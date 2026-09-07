import { CourseFormPage } from '@/features/admin/components/course-form-page';

export default async function EditCourse({
	params,
}: PageProps<'/admin/courses/[courseId]/edit'>) {
	const { courseId } = await params;
	return <CourseFormPage mode="edit" courseId={courseId} />;
}
