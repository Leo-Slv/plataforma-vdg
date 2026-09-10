import Link from 'next/link';

import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes/app-routes';
import type { Video } from '@/features/admin/model/video';
import type { LessonLookupEntry } from '@/features/admin/lib/build-lesson-lookup';

type VideosTableProps = {
	videos: Video[];
	lessonLookup: Map<string, LessonLookupEntry>;
	lookupReady: boolean;
};

const COLUMNS = 'grid-cols-[1.6fr_1.6fr_1fr_1.1fr]';

function lessonLabel(
	video: Video,
	lessonLookup: Map<string, LessonLookupEntry>,
	lookupReady: boolean,
) {
	const entry = lessonLookup.get(video.lessonId);
	if (entry) {
		return `${entry.courseTitle} · Aula ${String(entry.modulePosition).padStart(2, '0')}`;
	}
	return lookupReady ? '—' : '…';
}

function VideosTable({ videos, lessonLookup, lookupReady }: VideosTableProps) {
	if (videos.length === 0) {
		return (
			<p className="py-12 text-center font-sans text-sm font-light text-foreground/45">
				Nenhum vídeo cadastrado.
			</p>
		);
	}

	return (
		<div>
			<div
				className={cn(
					'grid gap-4 border-b border-foreground/12 pb-3 font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase',
					COLUMNS,
				)}
			>
				<span>ID do YouTube</span>
				<span>Aula vinculada</span>
				<span>Duração</span>
				<span>Status</span>
			</div>

			{videos.map((video) => {
				const isActive = video.visibility === 'Active';

				return (
					<Link
						key={video.id}
						href={appRoutes.admin.videoEdit(video.id, video.lessonId)}
						className={cn(
							'grid items-center gap-4 border-b border-foreground/7 py-4.5 font-sans text-[13.5px] text-foreground/75 hover:bg-foreground/3',
							COLUMNS,
						)}
					>
						<div>
							{video.youTubeVideoId ? (
								<>
									<div className="font-mono text-[13.5px] text-foreground">
										{video.youTubeVideoId}
									</div>
									<div className="mt-1 font-sans text-[11px] font-light text-foreground/35">
										youtube.com/watch?v={video.youTubeVideoId}
									</div>
								</>
							) : (
								<div className="font-mono text-[13px] text-foreground/50">
									{video.storageProvider}: {video.storageKey}
								</div>
							)}
						</div>
						<span className="text-foreground/55">
							{lessonLabel(video, lessonLookup, lookupReady)}
						</span>
						<span>{Math.floor(video.durationSeconds / 60)}min</span>
						<span
							className={cn(
								isActive ? 'text-[oklch(0.75_0.1_248)]' : 'text-foreground/45',
							)}
						>
							{isActive ? 'Ativo' : 'Não listado'}
						</span>
					</Link>
				);
			})}
		</div>
	);
}

export { VideosTable };
