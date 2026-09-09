import { cn } from '@/lib/utils';
import type { Video } from '@/features/admin/model/video';
import type { LessonLookupEntry } from '@/features/admin/lib/build-lesson-lookup';

type VideosTableProps = {
	videos: Video[];
	lessonLookup: Map<string, LessonLookupEntry>;
	lookupReady: boolean;
	pendingVideoId: string | null;
	onActivate: (videoId: string) => void;
	onUnlist: (videoId: string) => void;
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

function VideosTable({
	videos,
	lessonLookup,
	lookupReady,
	pendingVideoId,
	onActivate,
	onUnlist,
}: VideosTableProps) {
	if (videos.length === 0) {
		return (
			<p className="py-12 text-center font-sans text-sm font-light text-white/45">
				Nenhum vídeo cadastrado.
			</p>
		);
	}

	return (
		<div>
			<div
				className={cn(
					'grid gap-4 border-b border-white/12 pb-3 font-heading text-[10px] tracking-[0.14em] text-white/40 uppercase',
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
				const isPending = pendingVideoId === video.id;

				return (
					<div
						key={video.id}
						className={cn(
							'grid items-center gap-4 border-b border-white/7 py-4.5 font-sans text-[13.5px] text-white/75',
							COLUMNS,
						)}
					>
						<div>
							{video.youTubeVideoId ? (
								<>
									<div className="font-mono text-[13.5px] text-[#f2f2f0]">
										{video.youTubeVideoId}
									</div>
									<div className="mt-1 font-sans text-[11px] font-light text-white/35">
										youtube.com/watch?v={video.youTubeVideoId}
									</div>
								</>
							) : (
								<div className="font-mono text-[13px] text-white/50">
									{video.storageProvider}: {video.storageKey}
								</div>
							)}
						</div>
						<span className="text-white/55">
							{lessonLabel(video, lessonLookup, lookupReady)}
						</span>
						<span>{Math.floor(video.durationSeconds / 60)}min</span>
						<div className="flex items-center gap-3">
							<span
								className={cn(
									isActive ? 'text-[oklch(0.75_0.1_248)]' : 'text-white/45',
								)}
							>
								{isActive ? 'Ativo' : 'Não listado'}
							</span>
							<button
								type="button"
								onClick={() =>
									isActive ? onUnlist(video.id) : onActivate(video.id)
								}
								disabled={isPending}
								className="font-sans text-[11.5px] text-white/40 underline underline-offset-2 disabled:opacity-50"
							>
								{isActive ? 'Não listar' : 'Ativar'}
							</button>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export { VideosTable };
