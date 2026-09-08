import { cn } from '@/lib/utils';
import { formatDurationMinutes } from '@/features/admin/lib/format-duration-minutes';
import { ReorderButtons } from '@/features/admin/components/reorder-buttons';
import type { Lesson } from '@/features/admin/model/lesson';

type AdminLessonRowProps = {
	lesson: Lesson;
	position: number;
	canMoveUp: boolean;
	canMoveDown: boolean;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onEdit: () => void;
	onDelete: () => void;
	isDeleting: boolean;
	deleteError?: string | null;
};

function AdminLessonRow({
	lesson,
	position,
	canMoveUp,
	canMoveDown,
	onMoveUp,
	onMoveDown,
	onEdit,
	onDelete,
	isDeleting,
	deleteError,
}: AdminLessonRowProps) {
	return (
		<div className="border-t border-white/6 py-3.5 pl-13.5">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3.5">
					<ReorderButtons
						canMoveUp={canMoveUp}
						canMoveDown={canMoveDown}
						onMoveUp={onMoveUp}
						onMoveDown={onMoveDown}
					/>
					<div>
						<div className="font-sans text-[14px] text-[#f2f2f0]">
							Aula {String(position + 1).padStart(2, '0')} — {lesson.title}
						</div>
						<div className="mt-1 font-sans text-[11.5px] font-light text-white/40">
							{formatDurationMinutes(lesson.durationSeconds)}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<span
						className={cn(
							'rounded-full px-2.25 py-1.25 font-heading text-[10px] tracking-[0.1em] uppercase',
							lesson.freePreview
								? 'bg-[oklch(0.3_0.07_248)] text-[oklch(0.85_0.08_248)]'
								: 'bg-white/8 text-white/50',
						)}
					>
						{lesson.freePreview ? 'Gratuita' : 'Paga'}
					</span>
					<button
						type="button"
						onClick={onEdit}
						className="font-sans text-[12.5px] text-white/50"
					>
						Editar
					</button>
					<button
						type="button"
						onClick={onDelete}
						disabled={isDeleting}
						className="font-sans text-[12.5px] text-[oklch(0.65_0.16_25)] disabled:opacity-60"
					>
						{isDeleting ? 'Excluindo...' : 'Excluir'}
					</button>
				</div>
			</div>
			{deleteError ? (
				<p className="mt-2 text-[12px] text-[oklch(0.704_0.191_22.216)]">
					{deleteError}
				</p>
			) : null}
		</div>
	);
}

export { AdminLessonRow };
