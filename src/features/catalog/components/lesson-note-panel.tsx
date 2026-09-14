'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/lib/constants/query-keys';
import { isApiError } from '@/lib/http/api-error';
import {
	useLessonNoteQuery,
	useRemoveLessonNoteMutation,
	useSaveLessonNoteMutation,
} from '@/features/catalog/hooks/catalog.queries';
import type { LessonNote } from '@/features/catalog/model/lesson-note';

type LessonNotePanelProps = {
	lessonId: string;
	enabled: boolean;
};

function LessonNotePanel({ lessonId, enabled }: LessonNotePanelProps) {
	const queryClient = useQueryClient();
	const noteQuery = useLessonNoteQuery(lessonId, { enabled });
	const saveMutation = useSaveLessonNoteMutation();
	const removeMutation = useRemoveLessonNoteMutation();

	const [content, setContent] = useState('');
	const [seededNote, setSeededNote] = useState<LessonNote | undefined>(
		undefined,
	);

	if (noteQuery.data !== undefined && noteQuery.data !== seededNote) {
		setSeededNote(noteQuery.data);
		setContent(noteQuery.data.content);
	}

	const noteNotFound =
		noteQuery.isError &&
		isApiError(noteQuery.error) &&
		noteQuery.error.status === 404;
	const hasRealError = noteQuery.isError && !noteNotFound;

	if (noteQuery.isPending) {
		return (
			<p className="font-sans text-[13px] font-light text-foreground/45">
				Carregando…
			</p>
		);
	}

	if (hasRealError) {
		return (
			<div className="flex flex-col items-center gap-3 py-6 text-center">
				<p className="font-sans text-[13px] font-light text-foreground/50">
					Não foi possível carregar sua anotação agora.
				</p>
				<button
					type="button"
					onClick={() => noteQuery.refetch()}
					className="rounded-full border border-foreground/20 px-5 py-2.5 font-sans text-[12.5px] text-foreground"
				>
					Tentar novamente
				</button>
			</div>
		);
	}

	function handleSave() {
		saveMutation.mutate(
			{ lessonId, content },
			{
				onSuccess: (note) => {
					queryClient.setQueryData(queryKeys.lessons.note(lessonId), note);
					toast.success('Nota salva.');
				},
				onError: () => {
					toast.error('Não foi possível salvar sua anotação agora.');
				},
			},
		);
	}

	function handleClear() {
		removeMutation.mutate(lessonId, {
			onSuccess: () => {
				setContent('');
				queryClient.removeQueries({
					queryKey: queryKeys.lessons.note(lessonId),
				});
				toast.success('Nota removida.');
			},
			onError: () => {
				toast.error('Não foi possível remover sua anotação agora.');
			},
		});
	}

	const isMutating = saveMutation.isPending || removeMutation.isPending;

	return (
		<div className="flex flex-col gap-3">
			<textarea
				value={content}
				onChange={(event) => setContent(event.target.value)}
				rows={5}
				placeholder="Escreva suas anotações sobre esta aula..."
				className="w-full resize-none rounded-lg border border-foreground/15 bg-transparent px-3.5 py-3.5 font-sans text-[13.5px] leading-[1.6] font-light text-foreground outline-none placeholder:text-foreground/35 focus:border-[oklch(0.62_0.1_248)]"
			/>
			<div className="flex items-center gap-4">
				<button
					type="button"
					onClick={handleSave}
					disabled={isMutating || content.trim().length === 0}
					className="rounded-full bg-foreground px-5 py-2.5 font-sans text-[12.5px] text-background disabled:opacity-50"
				>
					{saveMutation.isPending ? 'Salvando...' : 'Salvar'}
				</button>
				{!noteNotFound ? (
					<button
						type="button"
						onClick={handleClear}
						disabled={isMutating}
						className="font-sans text-[12.5px] text-foreground/45 disabled:opacity-50"
					>
						Limpar
					</button>
				) : null}
			</div>
		</div>
	);
}

export { LessonNotePanel };
