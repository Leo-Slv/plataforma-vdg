import { cn } from '@/lib/utils';
import type { AreaSummary } from '@/features/catalog/model/course-catalog';

type CatalogPageHeaderProps = {
	areas: AreaSummary[];
	selectedAreaId: string | null;
	onSelectArea: (areaId: string | null) => void;
	search: string;
	onSearchChange: (value: string) => void;
	courseCount: number;
	areaCount: number;
};

function CatalogPageHeader({
	areas,
	selectedAreaId,
	onSelectArea,
	search,
	onSearchChange,
	courseCount,
	areaCount,
}: CatalogPageHeaderProps) {
	return (
		<div className="px-5 pt-11 pb-2 sm:px-10">
			<h1 className="font-heading text-[32px] font-extralight sm:text-[44px]">
				Catálogo
			</h1>
			<p className="mt-3 max-w-[560px] text-[15px] leading-[1.65] font-light text-white/50">
				{courseCount} cursos organizados em {areaCount} áreas. Os cursos da sua
				área abrem direto; os demais exigem inscrição ou concessão da liderança.
			</p>

			<div className="mt-8 flex flex-wrap items-center gap-2.5">
				<button
					type="button"
					onClick={() => onSelectArea(null)}
					className={cn(
						'rounded-full px-4.5 py-2.75 font-sans text-[12.5px] whitespace-nowrap',
						selectedAreaId === null
							? 'bg-[#f4f4f2] text-[#0a0a0b]'
							: 'border border-white/16 text-white/70',
					)}
				>
					Todas as áreas
				</button>
				{areas.map((area) => (
					<button
						key={area.id}
						type="button"
						onClick={() => onSelectArea(area.id)}
						className={cn(
							'rounded-full px-4.5 py-2.75 font-sans text-[12.5px] whitespace-nowrap',
							selectedAreaId === area.id
								? 'bg-[#f4f4f2] text-[#0a0a0b]'
								: 'border border-white/16 text-white/70',
						)}
					>
						{area.name}
					</button>
				))}

				<input
					type="search"
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder="Buscar curso…"
					className="ml-auto min-w-[200px] border-0 border-b border-white/14 bg-transparent py-2 font-sans text-[12.5px] font-light text-[#f2f2f0] outline-none placeholder:text-white/45"
				/>
			</div>
		</div>
	);
}

export { CatalogPageHeader };
