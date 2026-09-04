import { CourseDetailPage } from '@/features/catalog/components/course-detail-page';

export default async function CourseDetail({
	params,
}: PageProps<'/courses/[slug]'>) {
	const { slug } = await params;
	return <CourseDetailPage slug={slug} />;
}
