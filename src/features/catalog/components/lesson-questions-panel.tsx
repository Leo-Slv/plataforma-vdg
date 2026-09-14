'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { queryKeys } from '@/lib/constants/query-keys';
import {
	useAskLessonQuestionMutation,
	useLessonQuestionsQuery,
} from '@/features/catalog/hooks/catalog.queries';
import { LessonQuestionItem } from '@/features/catalog/components/lesson-question-item';
import {
	askLessonQuestionFormSchema,
	type AskLessonQuestionFormValues,
} from '@/features/catalog/schemas/ask-lesson-question-form.schema';

type LessonQuestionsPanelProps = {
	lessonId: string;
	enabled: boolean;
};

function LessonQuestionsPanel({
	lessonId,
	enabled,
}: LessonQuestionsPanelProps) {
	const queryClient = useQueryClient();
	const questionsQuery = useLessonQuestionsQuery(lessonId, { enabled });
	const askMutation = useAskLessonQuestionMutation();

	const form = useForm<AskLessonQuestionFormValues>({
		resolver: zodResolver(askLessonQuestionFormSchema),
		defaultValues: { questionText: '' },
	});

	function handleAsk(values: AskLessonQuestionFormValues) {
		askMutation.mutate(
			{ lessonId, questionText: values.questionText },
			{
				onSuccess: () => {
					form.reset({ questionText: '' });
					queryClient.invalidateQueries({
						queryKey: queryKeys.lessons.questions(lessonId),
					});
					toast.success('Pergunta enviada.');
				},
				onError: () => {
					toast.error('Não foi possível enviar sua pergunta agora.');
				},
			},
		);
	}

	return (
		<div className="flex flex-col gap-5">
			{questionsQuery.isPending ? (
				<p className="font-sans text-[13px] font-light text-foreground/45">
					Carregando…
				</p>
			) : questionsQuery.isError ? (
				<div className="flex flex-col items-center gap-3 py-6 text-center">
					<p className="font-sans text-[13px] font-light text-foreground/50">
						Não foi possível carregar as perguntas agora.
					</p>
					<button
						type="button"
						onClick={() => questionsQuery.refetch()}
						className="rounded-full border border-foreground/20 px-5 py-2.5 font-sans text-[12.5px] text-foreground"
					>
						Tentar novamente
					</button>
				</div>
			) : questionsQuery.data.length === 0 ? (
				<p className="font-sans text-[13px] font-light text-foreground/45">
					Nenhuma pergunta ainda — seja o primeiro.
				</p>
			) : (
				<div>
					{questionsQuery.data.map((question) => (
						<LessonQuestionItem key={question.id} question={question} />
					))}
				</div>
			)}

			<form
				onSubmit={form.handleSubmit(handleAsk)}
				noValidate
				className="flex flex-col gap-2.5 border-t border-foreground/9 pt-5"
			>
				<textarea
					rows={3}
					placeholder="Faça uma pergunta sobre esta aula..."
					aria-invalid={Boolean(form.formState.errors.questionText)}
					className="w-full resize-none rounded-lg border border-foreground/15 bg-transparent px-3.5 py-3.5 font-sans text-[13.5px] leading-[1.6] font-light text-foreground outline-none placeholder:text-foreground/35 focus:border-[oklch(0.62_0.1_248)]"
					{...form.register('questionText')}
				/>
				{form.formState.errors.questionText ? (
					<p className="font-sans text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
						{form.formState.errors.questionText.message}
					</p>
				) : null}
				<button
					type="submit"
					disabled={askMutation.isPending}
					className="self-start rounded-full bg-foreground px-5 py-2.5 font-sans text-[12.5px] text-background disabled:opacity-50"
				>
					{askMutation.isPending ? 'Enviando...' : 'Perguntar'}
				</button>
			</form>
		</div>
	);
}

export { LessonQuestionsPanel };
