import { UserAvatar } from '@/components/user-avatar';
import { formatRelativeTime } from '@/features/catalog/lib/format-relative-time';
import { getInitials } from '@/features/catalog/lib/user-display';
import type { LessonQuestion } from '@/features/catalog/model/lesson-question';

type LessonQuestionReplyProps = {
	isReplying: boolean;
	replyText: string;
	onReplyTextChange: (value: string) => void;
	onStartReply: () => void;
	onCancelReply: () => void;
	onSubmitReply: () => void;
	isSubmitting: boolean;
};

type LessonQuestionItemProps = {
	question: LessonQuestion;
	reply?: LessonQuestionReplyProps;
};

function LessonQuestionItem({ question, reply }: LessonQuestionItemProps) {
	const now = new Date();

	return (
		<div className="border-b border-foreground/8 py-4.5 last:border-b-0">
			<div className="flex items-baseline justify-between gap-3">
				<span className="flex items-center gap-2 font-sans text-[13px] text-foreground/85">
					<UserAvatar
						avatarUrl={question.askedByAvatarUrl}
						initials={getInitials(question.askedByName)}
						className="size-6 text-[10px]"
					/>
					{question.askedByName}
				</span>
				<span className="flex-none font-sans text-[11.5px] font-light text-foreground/35">
					{formatRelativeTime(question.createdAt, now)}
				</span>
			</div>
			<p className="mt-1.5 font-sans text-[13.5px] leading-[1.6] font-light text-foreground/70">
				{question.questionText}
			</p>

			{question.answerText ? (
				<div className="mt-3 border-l-2 border-[oklch(0.62_0.1_248)] pl-3.5">
					<span className="flex items-center gap-2 font-sans text-[12px] text-[oklch(0.72_0.1_248)]">
						<UserAvatar
							avatarUrl={question.answeredByAvatarUrl}
							initials={getInitials(question.answeredByName)}
							className="size-5.5 text-[9.5px]"
						/>
						{question.answeredByName}
					</span>
					<p className="mt-1 font-sans text-[13px] leading-[1.6] font-light text-foreground/60">
						{question.answerText}
					</p>
				</div>
			) : reply?.isReplying ? (
				<div className="mt-3 flex flex-col gap-2">
					<textarea
						value={reply.replyText}
						onChange={(event) => reply.onReplyTextChange(event.target.value)}
						rows={3}
						placeholder="Escreva a resposta..."
						className="w-full resize-none rounded-lg border border-foreground/15 bg-transparent px-3.5 py-3 font-sans text-[13px] leading-[1.5] font-light text-foreground outline-none focus:border-[oklch(0.62_0.1_248)]"
					/>
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={reply.onSubmitReply}
							disabled={
								reply.isSubmitting || reply.replyText.trim().length === 0
							}
							className="rounded-full bg-foreground px-4 py-2 font-sans text-[12px] text-background disabled:opacity-50"
						>
							{reply.isSubmitting ? 'Enviando...' : 'Enviar resposta'}
						</button>
						<button
							type="button"
							onClick={reply.onCancelReply}
							className="font-sans text-[12px] text-foreground/45"
						>
							Cancelar
						</button>
					</div>
				</div>
			) : reply ? (
				<button
					type="button"
					onClick={reply.onStartReply}
					className="mt-3 font-sans text-[12px] text-[oklch(0.72_0.1_248)]"
				>
					Responder
				</button>
			) : null}
		</div>
	);
}

export { LessonQuestionItem };
