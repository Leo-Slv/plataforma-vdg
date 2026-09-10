'use client';

import { useState } from 'react';

import { AdminModal } from '@/features/admin/components/admin-modal';
import { AdminSelect } from '@/features/admin/components/admin-select';
import type { Course } from '@/features/admin/model/course';

type GrantCourseAccessModalProps = {
	eligibleCourses: Course[];
	onClose: () => void;
	onSubmit: (courseId: string) => void;
	isSubmitting: boolean;
	error?: string | null;
};

function GrantCourseAccessModal({
	eligibleCourses,
	onClose,
	onSubmit,
	isSubmitting,
	error,
}: GrantCourseAccessModalProps) {
	const [courseId, setCourseId] = useState('');

	return (
		<AdminModal title="Conceder acesso a um curso pago" onClose={onClose}>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					if (courseId) {
						onSubmit(courseId);
					}
				}}
				className="flex flex-col gap-4.5"
			>
				{eligibleCourses.length === 0 ? (
					<p className="font-sans text-[13px] font-light text-foreground/50">
						Não há cursos pagos elegíveis para conceder no momento.
					</p>
				) : (
					<AdminSelect
						label="Curso"
						value={courseId}
						onChange={(event) => setCourseId(event.target.value)}
					>
						<option value="">Selecione…</option>
						{eligibleCourses.map((course) => (
							<option key={course.id} value={course.id}>
								{course.title}
							</option>
						))}
					</AdminSelect>
				)}
				{error ? (
					<p className="text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
						{error}
					</p>
				) : null}

				<div className="mt-1.5 flex justify-end gap-2.5">
					<button
						type="button"
						onClick={onClose}
						className="rounded-full border border-foreground/18 px-5 py-3 font-sans text-[13px] text-foreground/60"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={isSubmitting || !courseId}
						className="rounded-full bg-foreground px-5.5 py-3.25 font-sans text-[13px] text-background disabled:opacity-60"
					>
						{isSubmitting ? 'Concedendo...' : 'Conceder acesso'}
					</button>
				</div>
			</form>
		</AdminModal>
	);
}

export { GrantCourseAccessModal };
