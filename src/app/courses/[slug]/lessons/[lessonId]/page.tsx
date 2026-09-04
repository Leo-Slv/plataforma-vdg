import { LessonPlayerPage } from '@/features/catalog/components/lesson-player-page';

export default async function LessonPlayer({
	params,
}: PageProps<'/courses/[slug]/lessons/[lessonId]'>) {
	const { slug, lessonId } = await params;
	return <LessonPlayerPage slug={slug} lessonId={lessonId} />;
}
