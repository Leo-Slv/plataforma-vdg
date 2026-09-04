import { ModuleCard } from '@/features/catalog/components/module-card';
import type { CourseDetails } from '@/features/catalog/model/course-details';

type CourseDetailOwnedProps = {
	title: string;
	description: string;
	areaName: string | null;
	details: CourseDetails | undefined;
};

function CourseDetailOwned({
	title,
	description,
	areaName,
	details,
}: CourseDetailOwnedProps) {
	const modules = details?.modules ?? [];
	const lessonCount = modules.reduce(
		(total, module) => total + module.lessons.length,
		0,
	);
	const moduleWord = modules.length === 1 ? 'módulo' : 'módulos';
	const lessonWord = lessonCount === 1 ? 'aula' : 'aulas';

	return (
		<div className="px-5 py-11 sm:px-10">
			<div className="max-w-[720px]">
				{areaName ? (
					<div className="font-heading text-[11px] tracking-[0.18em] text-white/45 uppercase">
						{areaName}
					</div>
				) : null}
				<h1 className="mt-4 font-heading text-[40px] leading-[1.06] font-extralight tracking-tight sm:text-[52px]">
					{title}
				</h1>
				<p className="mt-5 max-w-[600px] text-[16px] leading-[1.7] font-light text-pretty text-white/60">
					{description}
				</p>

				{details ? (
					<div className="mt-8.5 flex gap-9 border-t border-b border-white/9 py-5.5 font-sans text-[13px] font-light text-white/45">
						<div>
							<div className="mb-1.25 font-heading text-xl font-light text-[#f2f2f0]">
								{modules.length}
							</div>
							{moduleWord}
						</div>
						<div>
							<div className="mb-1.25 font-heading text-xl font-light text-[#f2f2f0]">
								{lessonCount}
							</div>
							{lessonWord}
						</div>
					</div>
				) : null}

				<h2 className="mt-11 font-heading text-2xl font-light">
					Conteúdo do curso
				</h2>

				{details ? (
					<div className="mt-6 grid grid-cols-1 gap-5.5 sm:grid-cols-2">
						{modules.map((module, index) => (
							<ModuleCard
								key={module.id}
								module={module}
								position={index + 1}
							/>
						))}
					</div>
				) : (
					<p className="mt-4 font-sans text-sm font-light text-white/45">
						Carregando conteúdo…
					</p>
				)}
			</div>
		</div>
	);
}

export { CourseDetailOwned };
