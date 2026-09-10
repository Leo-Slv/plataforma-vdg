import { VideoEditPage } from '@/features/admin/components/video-edit-page';

export default async function AdminVideoEdit({
	params,
}: PageProps<'/admin/videos/[videoId]'>) {
	const { videoId } = await params;
	return <VideoEditPage videoId={videoId} />;
}
