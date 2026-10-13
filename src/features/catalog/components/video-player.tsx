'use client';

import { useEffect, useRef } from 'react';

import { LessonVideoPlaceholder } from '@/features/catalog/components/lesson-video-placeholder';
import {
	createWatchTracker,
	trackSeek,
	trackTimeUpdate,
	type WatchTracker,
} from '@/features/catalog/lib/watch-tracker';

type VideoPlayerStatus = 'loading' | 'error' | 'no-video' | 'ready';

type WatchReport = {
	watchedSeconds: number;
	positionSeconds: number;
	durationSeconds: number;
	flush: boolean;
};

type VideoPlayerProps = {
	status: VideoPlayerStatus;
	playbackUrl?: string;
	/**
	 * Native `<video>` only (YouTube's iframe embed exposes no player events).
	 * Reports the time really played (seeks do not count) and where the player
	 * is. `flush` is true when the viewer paused, finished or is leaving, so the
	 * caller should send it right away instead of waiting for its throttle.
	 */
	onWatch?: (report: WatchReport) => void;
	/** Seconds already counted as watched for this lesson (saved progress). */
	initialWatchedSeconds?: number;
	/** Saved player position; the video opens there. */
	resumeFromSeconds?: number;
};

/** Videos shown through an iframe (YouTube): they report no playback progress. */
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

/** Do not resume in the last seconds: it would just show the end screen. */
const RESUME_END_MARGIN_SECONDS = 5;

type NativeVideoProps = {
	playbackUrl: string;
	onWatch?: (report: WatchReport) => void;
	initialWatchedSeconds: number;
	resumeFromSeconds: number;
};

function NativeVideo({
	playbackUrl,
	onWatch,
	initialWatchedSeconds,
	resumeFromSeconds,
}: NativeVideoProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const trackerRef = useRef<WatchTracker>(
		createWatchTracker(initialWatchedSeconds),
	);
	const onWatchRef = useRef(onWatch);
	useEffect(() => {
		onWatchRef.current = onWatch;
	});

	// React detaches the DOM ref before passive cleanups run, so the last known
	// position is kept here for the flush that happens when the lesson is left.
	const snapshotRef = useRef<{ position: number; duration: number } | null>(
		null,
	);

	function report(flush: boolean) {
		const video = videoRef.current;
		if (video && Number.isFinite(video.duration)) {
			snapshotRef.current = {
				position: video.currentTime,
				duration: video.duration,
			};
		}
		const snapshot = snapshotRef.current;
		if (!snapshot) {
			return;
		}
		onWatchRef.current?.({
			watchedSeconds: Math.floor(trackerRef.current.watchedSeconds),
			positionSeconds: Math.floor(snapshot.position),
			durationSeconds: snapshot.duration,
			flush,
		});
	}

	// Send what was watched when the viewer leaves the lesson or hides the tab.
	useEffect(() => {
		function handleHidden() {
			if (document.visibilityState === 'hidden') {
				report(true);
			}
		}
		document.addEventListener('visibilitychange', handleHidden);
		return () => {
			document.removeEventListener('visibilitychange', handleHidden);
			report(true);
		};
	}, []);

	return (
		<div className="aspect-video overflow-hidden rounded-lg bg-black">
			<video
				ref={videoRef}
				src={playbackUrl}
				controls
				playsInline
				className="size-full"
				onLoadedMetadata={(event) => {
					const video = event.currentTarget;
					if (
						resumeFromSeconds > 0 &&
						resumeFromSeconds < video.duration - RESUME_END_MARGIN_SECONDS
					) {
						video.currentTime = resumeFromSeconds;
					}
				}}
				onSeeking={() => {
					trackerRef.current = trackSeek(trackerRef.current);
				}}
				onTimeUpdate={(event) => {
					trackerRef.current = trackTimeUpdate(
						trackerRef.current,
						event.currentTarget.currentTime,
					);
					report(false);
				}}
				onPause={() => report(true)}
				onEnded={() => report(true)}
			>
				<track kind="captions" />
			</video>
		</div>
	);
}

function VideoPlayer({
	status,
	playbackUrl,
	onWatch,
	initialWatchedSeconds = 0,
	resumeFromSeconds = 0,
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
			<NativeVideo
				key={playbackUrl}
				playbackUrl={playbackUrl}
				onWatch={onWatch}
				initialWatchedSeconds={initialWatchedSeconds}
				resumeFromSeconds={resumeFromSeconds}
			/>
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

export { VideoPlayer, isEmbeddableUrl };
export type { VideoPlayerStatus, WatchReport };
