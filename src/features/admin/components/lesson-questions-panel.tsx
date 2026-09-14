'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/lib/constants/query-keys';
import { formatRelativeTime } from '@/features/admin/lib/format-relative-time';
import {
	useAnswerLessonQuestionMutation,
	useLessonQuestionsQuery,
	useRemoveLessonQuestionMutation,
} from '@/features/admin/hooks/admin.queries';

type LessonQuestionsPanelProps = {
	lessonId: string;
};

function LessonQuestionsPanel({ lessonId }: LessonQuestionsPanelProps) {
	const queryClient = useQueryClient();
	const questionsQuery = useLessonQuestionsQuery(lessonId, { enabled: true });
	const answerMutation = useAnswerLessonQuestionMutation();
	const removeMutation = useRemoveLessonQuestionMutation();

	const [replyingId, setReplyingId] = useState<string | null>(null);
	const [replyText, setReplyText] = useState('');
	const [pendingId, setPendingId] = useState<string | null>(null);

	function invalidate() {
		queryClient.invalidateQueries({
			queryKey: queryKeys.admin.lessonQuestions(lessonId),
		});
	}

	function handleStartReply(questionId: string) {
		setReplyingId(questionId);
		setReplyText('');
	}

	function handleSubmitAnswer(questionId: string) {
		setPendingId(questionId);
		answerMutation.mutate(
			{ questionId, answerText: replyText },
			{
				onSuccess: () => {
					setReplyingId(null);
					setReplyText('');
					invalidate();
					toast.success('Resposta enviada.');
				},
				onError: () => toast.error('Não foi possível enviar a resposta agora.'),
				onSettled: () => setPendingId(null),
			},
		);
	}

	function handleRemove(questionId: string) {
		setPendingId(questionId);
		removeMutation.mutate(questionId, {
			onSuccess: () => {
				invalidate();
				toast.success('Pergunta removida.');
			},
			onError: () => toast.error('Não foi possível remover a pergunta agora.'),
			onSettled: () => setPendingId(null),
		});
	}

	const now = new Date();

	return (
		<div>
			<div className="mb-2.25 font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
				Perguntas dos alunos
			</div>

			{questionsQuery.isPending ? (
				<p className="font-sans text-[12px] font-light text-foreground/35">
					Carregando…
				</p>
			) : questionsQuery.isError ? (
				<p className="font-sans text-[12px] font-light text-foreground/35">
					Não foi possível carregar as perguntas desta aula agora.
				</p>
			) : questionsQuery.data.length === 0 ? (
				<p className="font-sans text-[12px] font-light text-foreground/35">
					Nenhuma pergunta ainda.
				</p>
			) : (
				<div className="flex flex-col gap-3">
					{questionsQuery.data.map((question) => {
						const isPending = pendingId === question.id;

						return (
							<div
								key={question.id}
								className="rounded-[10px] border border-foreground/12 p-4"
							>
								<div className="flex items-baseline justify-between gap-3">
									<span className="font-sans text-[12.5px] text-foreground">
										{question.askedByName}
									</span>
									<span className="flex-none font-sans text-[11px] font-light text-foreground/35">
										{formatRelativeTime(question.createdAt, now)}
									</span>
								</div>
								<p className="mt-1.5 font-sans text-[13px] leading-[1.6] font-light text-foreground/70">
									{question.questionText}
								</p>

								{question.answerText ? (
									<div className="mt-3 border-l-2 border-[oklch(0.62_0.1_248)] pl-3.5">
										<span className="font-sans text-[11.5px] text-[oklch(0.72_0.1_248)]">
											{question.answeredByName}
										</span>
										<p className="mt-1 font-sans text-[12.5px] leading-[1.6] font-light text-foreground/60">
											{question.answerText}
										</p>
										<button
											type="button"
											onClick={() => handleRemove(question.id)}
											disabled={isPending}
											className="mt-2 font-sans text-[12px] text-[oklch(0.65_0.16_25)] disabled:opacity-50"
										>
											Remover
										</button>
									</div>
								) : replyingId === question.id ? (
									<div className="mt-3 flex flex-col gap-2">
										<textarea
											value={replyText}
											onChange={(event) => setReplyText(event.target.value)}
											rows={3}
											placeholder="Escreva a resposta..."
											className="w-full resize-none rounded-md border border-foreground/12 bg-surface-2 px-3.5 py-3 font-sans text-[12.5px] leading-[1.5] font-light text-foreground outline-none focus:border-[oklch(0.62_0.1_248)]"
										/>
										<div className="flex items-center gap-4">
											<button
												type="button"
												onClick={() => handleSubmitAnswer(question.id)}
												disabled={isPending || replyText.trim().length === 0}
												className="rounded-full bg-foreground px-4 py-2 font-sans text-[12px] text-background disabled:opacity-50"
											>
												{isPending ? 'Enviando...' : 'Enviar resposta'}
											</button>
											<button
												type="button"
												onClick={() => setReplyingId(null)}
												className="font-sans text-[12px] text-foreground/45"
											>
												Cancelar
											</button>
										</div>
									</div>
								) : (
									<div className="mt-3 flex gap-4">
										<button
											type="button"
											onClick={() => handleStartReply(question.id)}
											className="font-sans text-[12px] text-[oklch(0.72_0.1_248)]"
										>
											Responder
										</button>
										<button
											type="button"
											onClick={() => handleRemove(question.id)}
											disabled={isPending}
											className="font-sans text-[12px] text-[oklch(0.65_0.16_25)] disabled:opacity-50"
										>
											Remover
										</button>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

export { LessonQuestionsPanel };
