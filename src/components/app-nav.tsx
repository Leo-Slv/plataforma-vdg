import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes/app-routes';

type AppNavProps = {
	displayName: string;
	initials: string;
	active: 'catalog' | 'my-courses';
};

function AppNav({ displayName, initials, active }: AppNavProps) {
	return (
		<header className="flex items-center justify-between border-b border-white/8 px-5 py-4.5 sm:px-10">
			<div className="flex items-center gap-8.5">
				<Image
					src="/brand/viver-da-graca-mark.png"
					alt="Viver da Graça"
					width={32}
					height={32}
					className="size-8 rounded-full object-cover"
				/>
				<nav className="hidden items-center gap-7 font-sans text-[13px] sm:flex">
					<Link
						href={appRoutes.catalog.index}
						className={cn(
							'pb-0.5',
							active === 'catalog'
								? 'border-b border-[#f2f2f0] text-[#f2f2f0]'
								: 'text-white/50',
						)}
					>
						Catálogo
					</Link>
					<Link
						href={appRoutes.myCourses.index}
						className={cn(
							'pb-0.5',
							active === 'my-courses'
								? 'border-b border-[#f2f2f0] text-[#f2f2f0]'
								: 'text-white/50',
						)}
					>
						Meus cursos
					</Link>
					<span className="text-white/50">Certificados</span>
				</nav>
			</div>

			<div className="flex items-center gap-3.5">
				{displayName ? (
					<span className="hidden font-sans text-xs font-light text-white/45 sm:inline">
						{displayName}
					</span>
				) : null}
				<span className="flex size-7.5 items-center justify-center rounded-full bg-[#22222a] font-heading text-xs">
					{initials}
				</span>
			</div>
		</header>
	);
}

export { AppNav };
