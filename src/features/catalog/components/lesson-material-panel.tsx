'use client';

import { toast } from 'sonner';

import {
	useLessonMaterialsQuery,
	useMaterialDownloadUrlMutation,
} from '@/features/catalog/hooks/catalog.queries';
import { formatMaterialType } from '@/features/catalog/lib/format-material-type';

type LessonMaterialPanelProps = {
	lessonId: string;
	enabled: boolean;
};

function LessonMaterialPanel({ lessonId, enabled }: LessonMaterialPanelProps) {
	const materialsQuery = useLessonMaterialsQuery(lessonId, { enabled });
	const downloadMutation = useMaterialDownloadUrlMutation();

	function handleDownload(materialId: string) {
		downloadMutation.mutate(materialId, {
			onSuccess: (download) => {
				window.open(download.downloadUrl, '_blank', 'noopener,noreferrer');
			},
			onError: () => {
				toast.error('Não foi possível baixar este material agora.');
			},
		});
	}

	if (materialsQuery.isPending) {
		return (
			<p className="font-sans text-[13px] font-light text-foreground/45">
				Carregando…
			</p>
		);
	}

	if (materialsQuery.isError) {
		return (
			<div className="flex flex-col items-center gap-3 py-6 text-center">
				<p className="font-sans text-[13px] font-light text-foreground/50">
					Não foi possível carregar os materiais agora.
				</p>
				<button
					type="button"
					onClick={() => materialsQuery.refetch()}
					className="rounded-full border border-foreground/20 px-5 py-2.5 font-sans text-[12.5px] text-foreground"
				>
					Tentar novamente
				</button>
			</div>
		);
	}

	if (materialsQuery.data.length === 0) {
		return (
			<div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-foreground/15 py-10 text-center text-foreground/35">
				<span aria-hidden className="font-heading text-2xl font-extralight">
					⎘
				</span>
				<span className="font-sans text-[13px] font-light">
					Nenhum material disponível ainda.
				</span>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
			{materialsQuery.data.map((material) => {
				const isDownloading =
					downloadMutation.isPending &&
					downloadMutation.variables === material.id;

				return (
					<button
						key={material.id}
						type="button"
						onClick={() => handleDownload(material.id)}
						disabled={isDownloading}
						className="flex flex-col items-start gap-1 rounded-md border border-foreground/12 bg-surface p-4 text-left disabled:opacity-60"
					>
						<span className="font-sans text-[13.5px] font-light text-foreground/70">
							{material.title}
						</span>
						<span className="font-mono text-[10.5px] text-foreground/35">
							{formatMaterialType(material.contentType)} ·{' '}
							{(material.sizeBytes / (1024 * 1024)).toFixed(1)} MB
						</span>
					</button>
				);
			})}
		</div>
	);
}

export { LessonMaterialPanel };
