import { formatRelativeTime } from '@/features/catalog/lib/format-relative-time';
import type { LessonQuestion } from '@/features/catalog/model/lesson-question';

type LessonQuestionItemProps = {
	question: LessonQuestion;
};

function LessonQuestionItem({ question }: LessonQuestionItemProps) {
	const now = new Date();

	return (
		<div className="border-b border-foreground/8 py-4.5 last:border-b-0">
			<div className="flex items-baseline justify-between gap-3">
				<span className="font-sans text-[13px] text-foreground/85">
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
					<span className="font-sans text-[12px] text-[oklch(0.72_0.1_248)]">
						{question.answeredByName}
					</span>
					<p className="mt-1 font-sans text-[13px] leading-[1.6] font-light text-foreground/60">
						{question.answerText}
					</p>
				</div>
			) : null}
		</div>
	);
}

export { LessonQuestionItem };
