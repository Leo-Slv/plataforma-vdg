import Link from 'next/link';

import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes/app-routes';
import { sortAreasByDisplayOrder } from '@/features/admin/lib/sort-areas';
import type { Area } from '@/features/admin/model/area';

type AreasTableProps = {
	areas: Area[];
};

const COLUMNS = 'grid-cols-[2fr_1.4fr_0.8fr_0.6fr_0.8fr]';

function AreasTable({ areas }: AreasTableProps) {
	if (areas.length === 0) {
		return (
			<p className="py-12 text-center font-sans text-sm font-light text-foreground/45">
				Nenhuma área cadastrada.
			</p>
		);
	}

	const sorted = sortAreasByDisplayOrder(areas);

	return (
		<div>
			<div
				className={cn(
					'grid gap-4 border-b border-foreground/12 pb-3 font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase',
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
				<Link
					key={area.id}
					href={appRoutes.admin.areaEdit(area.id)}
					className={cn(
						'grid items-center gap-4 border-b border-foreground/7 py-4.5 font-sans text-[13.5px] text-foreground/75 hover:bg-foreground/3',
						COLUMNS,
					)}
				>
					<span className="font-heading text-[15px] text-foreground">
						{area.name}
					</span>
					<span className="font-mono text-[11px] text-foreground/40">
						/{area.slug}
					</span>
					<span>{area.courseCount}</span>
					<span className="text-foreground/40">{area.displayOrder}</span>
					<span
						className={cn(
							'flex items-center gap-1.75',
							area.active ? 'text-[oklch(0.75_0.1_248)]' : 'text-foreground/40',
						)}
					>
						<span
							className={cn(
								'size-1.5 rounded-full',
								area.active ? 'bg-[oklch(0.75_0.1_248)]' : 'bg-foreground/40',
							)}
						/>
						{area.active ? 'Ativa' : 'Inativa'}
					</span>
				</Link>
			))}
		</div>
	);
}

export { AreasTable };
