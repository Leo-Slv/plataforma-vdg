import { cn } from '@/lib/utils';
import { sortAreasByDisplayOrder } from '@/features/admin/lib/sort-areas';
import type { Area } from '@/features/admin/model/area';

type AreasTableProps = {
	areas: Area[];
};

const COLUMNS = 'grid-cols-[2fr_1.4fr_0.8fr_0.6fr_0.8fr]';

function AreasTable({ areas }: AreasTableProps) {
	if (areas.length === 0) {
		return (
			<p className="py-12 text-center font-sans text-sm font-light text-white/45">
				Nenhuma área cadastrada.
			</p>
		);
	}

	const sorted = sortAreasByDisplayOrder(areas);

	return (
		<div>
			<div
				className={cn(
					'grid gap-4 border-b border-white/12 pb-3 font-heading text-[10px] tracking-[0.14em] text-white/40 uppercase',
					COLUMNS,
				)}
			>
				<span>Área</span>
				<span>Slug</span>
				<span>Cursos</span>
				<span>Ordem</span>
				<span>Status</span>
			</div>

			{sorted.map((area) => (
				<div
					key={area.id}
					className={cn(
						'grid items-center gap-4 border-b border-white/7 py-4.5 font-sans text-[13.5px] text-white/75',
						COLUMNS,
					)}
				>
					<span className="font-heading text-[15px] text-[#f2f2f0]">
						{area.name}
					</span>
					<span className="font-mono text-[11px] text-white/40">
						/{area.slug}
					</span>
					<span>{area.courseCount}</span>
					<span className="text-white/40">{area.displayOrder}</span>
					<span
						className={cn(
							'flex items-center gap-1.75',
							area.active ? 'text-[oklch(0.75_0.1_248)]' : 'text-white/40',
						)}
					>
						<span
							className={cn(
								'size-1.5 rounded-full',
								area.active ? 'bg-[oklch(0.75_0.1_248)]' : 'bg-white/40',
							)}
						/>
						{area.active ? 'Ativa' : 'Inativa'}
					</span>
				</div>
			))}
		</div>
	);
}

export { AreasTable };
