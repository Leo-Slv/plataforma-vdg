import { ReorderButtons } from '@/features/admin/components/reorder-buttons';
import { AdminLessonRow } from '@/features/admin/components/admin-lesson-row';
import type { CourseModule } from '@/features/admin/model/course-module';

type AdminModuleCardProps = {
	courseModule: CourseModule;
	position: number;
	canMoveUp: boolean;
	canMoveDown: boolean;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onEdit: () => void;
	onDelete: () => void;
	isDeletingModule: boolean;
	onAddLesson: () => void;
	onEditLesson: (lessonId: string) => void;
	onMoveLessonUp: (lessonId: string) => void;
	onMoveLessonDown: (lessonId: string) => void;
	onDeleteLesson: (lessonId: string) => void;
	deletingLessonId: string | null;
	lessonDeleteError: { lessonId: string; message: string } | null;
};

function AdminModuleCard({
	courseModule,
	position,
	canMoveUp,
	canMoveDown,
	onMoveUp,
	onMoveDown,
	onEdit,
	onDelete,
	isDeletingModule,
	onAddLesson,
	onEditLesson,
	onMoveLessonUp,
	onMoveLessonDown,
	onDeleteLesson,
	deletingLessonId,
	lessonDeleteError,
}: AdminModuleCardProps) {
	const hasLessons = courseModule.lessons.length > 0;

	return (
		<div className="overflow-hidden rounded-[10px] border border-white/10">
			<div className="flex items-center justify-between bg-[#101012] px-5 py-4.5">
				<div className="flex items-center gap-3.5">
					<ReorderButtons
						canMoveUp={canMoveUp}
						canMoveDown={canMoveDown}
						onMoveUp={onMoveUp}
						onMoveDown={onMoveDown}
					/>
					<div>
						<div className="font-heading text-[16px] font-light text-[#f2f2f0]">
							Módulo {String(position + 1).padStart(2, '0')} —{' '}
							{courseModule.title}
						</div>
						<div className="mt-0.5 font-sans text-[12px] font-light text-white/40">
							{courseModule.lessons.length === 1
								? '1 aula'
								: `${courseModule.lessons.length} aulas`}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<button
						type="button"
						onClick={onEdit}
						className="font-sans text-[12.5px] text-white/50"
					>
						Editar módulo
					</button>
					<button
						type="button"
						onClick={onDelete}
						disabled={hasLessons || isDeletingModule}
						title={
							hasLessons
								? 'Remova todas as aulas deste módulo antes de excluí-lo.'
								: undefined
						}
						className="font-sans text-[12.5px] text-[oklch(0.65_0.16_25)] disabled:opacity-30"
					>
						{isDeletingModule ? 'Excluindo...' : 'Excluir'}
					</button>
				</div>
			</div>

			{courseModule.lessons.map((lesson, index) => (
				<AdminLessonRow
					key={lesson.id}
					lesson={lesson}
					position={index}
					canMoveUp={index > 0}
					canMoveDown={index < courseModule.lessons.length - 1}
					onMoveUp={() => onMoveLessonUp(lesson.id)}
					onMoveDown={() => onMoveLessonDown(lesson.id)}
					onEdit={() => onEditLesson(lesson.id)}
					onDelete={() => onDeleteLesson(lesson.id)}
					isDeleting={deletingLessonId === lesson.id}
					deleteError={
						lessonDeleteError?.lessonId === lesson.id
							? lessonDeleteError.message
							: null
					}
				/>
			))}

			<div className="border-t border-white/6 py-3.5 pl-13.5">
				<button
					type="button"
					onClick={onAddLesson}
					className="font-sans text-[12.5px] text-[oklch(0.72_0.1_248)]"
				>
					+ Nova aula neste módulo
				</button>
			</div>
		</div>
	);
}

export { AdminModuleCard };
