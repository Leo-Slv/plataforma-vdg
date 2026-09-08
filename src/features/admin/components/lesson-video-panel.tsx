import { formatVideoStatus } from '@/features/admin/lib/format-video-status';
import type { Video } from '@/features/admin/model/video';

type LessonVideoPanelProps = {
	video: Video | null;
	isLoading: boolean;
	hasError: boolean;
	canManage: boolean;
	isMutating: boolean;
	onAdd: () => void;
	onReplace: () => void;
	onRemove: () => void;
};

function LessonVideoPanel({
	video,
	isLoading,
	hasError,
	canManage,
	isMutating,
	onAdd,
	onReplace,
	onRemove,
}: LessonVideoPanelProps) {
	return (
		<div>
			<div className="mb-2.25 font-heading text-[10px] tracking-[0.14em] text-white/40 uppercase">
				Vídeo da aula
			</div>
			<div className="rounded-[10px] border border-dashed border-white/20 p-5">
				{isLoading ? (
					<p className="font-sans text-[12px] font-light text-white/35">
						Carregando…
					</p>
				) : hasError ? (
					<p className="font-sans text-[12px] font-light text-white/35">
						Não foi possível carregar o vídeo desta aula agora.
					</p>
				) : video ? (
					<div className="flex flex-col gap-3">
						<div>
							<p className="font-sans text-[12px] font-light text-white/70">
								Vídeo enviado
							</p>
							<p className="mt-1 font-mono text-[10px] text-white/30">
								{Math.floor(video.durationSeconds / 60)}min ·{' '}
								{formatVideoStatus(video.status)}
							</p>
						</div>
						{canManage ? (
							<div className="flex gap-4">
								<button
									type="button"
									onClick={onReplace}
									disabled={isMutating}
									className="font-sans text-[12.5px] text-[oklch(0.72_0.1_248)] disabled:opacity-60"
								>
									Substituir vídeo
								</button>
								<button
									type="button"
									onClick={onRemove}
									disabled={isMutating}
									className="font-sans text-[12.5px] text-[oklch(0.65_0.16_25)] disabled:opacity-60"
								>
									Remover vídeo
								</button>
							</div>
						) : (
							<p className="font-sans text-[11.5px] font-light text-white/30">
								Requer a permissão de gerenciar vídeos.
							</p>
						)}
					</div>
				) : (
					<div className="flex flex-col items-center gap-2.5 py-2 text-center">
						<span className="font-sans text-[12px] font-light text-white/35">
							Nenhum vídeo cadastrado ainda.
						</span>
						{canManage ? (
							<button
								type="button"
								onClick={onAdd}
								disabled={isMutating}
								className="font-sans text-[12.5px] text-[oklch(0.72_0.1_248)] disabled:opacity-60"
							>
								Adicionar vídeo
							</button>
						) : (
							<span className="font-sans text-[11.5px] font-light text-white/30">
								Requer a permissão de gerenciar vídeos.
							</span>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export { LessonVideoPanel };
