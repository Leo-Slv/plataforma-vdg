'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/lib/constants/query-keys';
import {
	useCreateLessonMaterialMutation,
	useLessonMaterialsQuery,
	useRemoveLessonMaterialMutation,
} from '@/features/admin/hooks/admin.queries';
import { MaterialFormModal } from '@/features/admin/components/material-form-modal';
import type { CreateLessonMaterialPayload } from '@/features/admin/api/create-lesson-material';

type LessonMaterialsPanelProps = {
	lessonId: string;
	canManage: boolean;
};

function LessonMaterialsPanel({
	lessonId,
	canManage,
}: LessonMaterialsPanelProps) {
	const queryClient = useQueryClient();
	const materialsQuery = useLessonMaterialsQuery(lessonId, {
		enabled: canManage,
	});
	const createMutation = useCreateLessonMaterialMutation();
	const removeMutation = useRemoveLessonMaterialMutation();

	const [showModal, setShowModal] = useState(false);
	const [pendingId, setPendingId] = useState<string | null>(null);

	function invalidate() {
		queryClient.invalidateQueries({
			queryKey: queryKeys.admin.lessonMaterials(lessonId),
		});
	}

	function handleCreate(payload: CreateLessonMaterialPayload) {
		createMutation.mutate(
			{ lessonId, payload },
			{
				onSuccess: () => {
					invalidate();
					toast.success('Material adicionado.');
					setShowModal(false);
				},
				onError: () =>
					toast.error('Não foi possível adicionar o material agora.'),
			},
		);
	}

	function handleRemove(materialId: string) {
		setPendingId(materialId);
		removeMutation.mutate(materialId, {
			onSuccess: () => {
				invalidate();
				toast.success('Material removido.');
			},
			onError: () => toast.error('Não foi possível remover o material agora.'),
			onSettled: () => setPendingId(null),
		});
	}

	return (
		<div>
			<div className="mb-2.25 flex items-center justify-between">
				<div className="font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
					Materiais da aula
				</div>
				{canManage ? (
					<button
						type="button"
						onClick={() => setShowModal(true)}
						className="font-sans text-[12px] text-[oklch(0.72_0.1_248)]"
					>
						Adicionar material
					</button>
				) : null}
			</div>

			{!canManage ? (
				<p className="font-sans text-[11.5px] font-light text-foreground/30">
					Requer a permissão de gerenciar vídeos.
				</p>
			) : materialsQuery.isPending ? (
				<p className="font-sans text-[12px] font-light text-foreground/35">
					Carregando…
				</p>
			) : materialsQuery.isError ? (
				<p className="font-sans text-[12px] font-light text-foreground/35">
					Não foi possível carregar os materiais desta aula agora.
				</p>
			) : materialsQuery.data.length === 0 ? (
				<p className="font-sans text-[12px] font-light text-foreground/35">
					Nenhum material cadastrado ainda.
				</p>
			) : (
				<div className="flex flex-col gap-2.5">
					{materialsQuery.data.map((material) => (
						<div
							key={material.id}
							className="flex items-center justify-between gap-3 rounded-[10px] border border-foreground/12 p-4"
						>
							<div className="min-w-0">
								<p className="truncate font-sans text-[13px] text-foreground">
									{material.title}
								</p>
								<p className="mt-1 truncate font-mono text-[10px] text-foreground/35">
									{material.fileName} ·{' '}
									{(material.sizeBytes / (1024 * 1024)).toFixed(1)} MB
								</p>
							</div>
							<button
								type="button"
								onClick={() => handleRemove(material.id)}
								disabled={pendingId === material.id}
								className="flex-none font-sans text-[12px] text-[oklch(0.65_0.16_25)] disabled:opacity-50"
							>
								Remover
							</button>
						</div>
					))}
				</div>
			)}

			{showModal ? (
				<MaterialFormModal
					lessonId={lessonId}
					onClose={() => setShowModal(false)}
					onSubmit={handleCreate}
					isSubmitting={createMutation.isPending}
				/>
			) : null}
		</div>
	);
}

export { LessonMaterialsPanel };
