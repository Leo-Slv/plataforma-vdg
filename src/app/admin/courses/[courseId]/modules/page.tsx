import { CourseModulesPage } from '@/features/admin/components/course-modules-page';

export default async function CourseModules({
	params,
}: PageProps<'/admin/courses/[courseId]/modules'>) {
	const { courseId } = await params;
	return <CourseModulesPage courseId={courseId} />;
}
