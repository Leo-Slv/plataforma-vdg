import { LessonVideoPlaceholder } from '@/features/catalog/components/lesson-video-placeholder';

type VideoPlayerStatus = 'loading' | 'error' | 'no-video' | 'ready';

type VideoPlayerProps = {
	status: VideoPlayerStatus;
	playbackUrl?: string;
	/**
	 * Fired from the native `<video>` element's `timeupdate` (S3-hosted
	 * videos only — YouTube's iframe embed exposes no such event without
	 * the separate IFrame Player API, so this never fires for it).
	 */
	onProgress?: (currentTime: number) => void;
	/** Fired once when a native (non-YouTube) video reaches its end. */
	onEnded?: (duration: number) => void;
};

function isEmbeddableUrl(url: string) {
	return url.includes('youtube') || url.includes('youtu.be');
}

function VideoMessage({ children }: { children: string }) {
	return (
		<div
			className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-black"
			style={{
				backgroundImage:
					'repeating-linear-gradient(135deg, var(--surface-2) 0 10px, var(--stripe-2) 10px 20px)',
			}}
		>
			<span className="font-sans text-[13px] font-light text-foreground/45">
				{children}
			</span>
		</div>
	);
}

function VideoPlayer({
	status,
	playbackUrl,
	onProgress,
	onEnded,
}: VideoPlayerProps) {
	if (status === 'ready' && playbackUrl) {
		if (isEmbeddableUrl(playbackUrl)) {
			return (
				<div className="aspect-video overflow-hidden rounded-lg bg-black">
					<iframe
						src={playbackUrl}
						title="Vídeo da aula"
						className="size-full"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
					/>
				</div>
			);
		}

		return (
			<div className="aspect-video overflow-hidden rounded-lg bg-black">
				<video
					src={playbackUrl}
					controls
					playsInline
					className="size-full"
					onTimeUpdate={(event) =>
						onProgress?.(event.currentTarget.currentTime)
					}
					onEnded={(event) => onEnded?.(event.currentTarget.duration)}
				>
					<track kind="captions" />
				</video>
			</div>
		);
	}

	if (status === 'loading') {
		return <VideoMessage>Carregando vídeo…</VideoMessage>;
	}

	if (status === 'error') {
		return (
			<VideoMessage>Não foi possível carregar o vídeo agora.</VideoMessage>
		);
	}

	return <LessonVideoPlaceholder />;
}

export { VideoPlayer };
export type { VideoPlayerStatus };
