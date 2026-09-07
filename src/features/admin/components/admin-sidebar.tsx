import Image from 'next/image';

import { cn } from '@/lib/utils';

type AdminSidebarProps = {
	active: 'areas';
};

const NAV_ITEMS = [
	'Cursos',
	'Áreas',
	'Usuários',
	'Vídeos',
	'Auditoria',
] as const;

function AdminSidebar({ active }: AdminSidebarProps) {
	return (
		<div className="border-r border-white/8 p-5">
			<div className="flex items-center gap-2.75 border-b border-white/8 pb-6">
				<Image
					src="/brand/viver-da-graca-mark.png"
					alt="Viver da Graça"
					width={28}
					height={28}
					className="size-7 rounded-full object-cover"
				/>
				<span className="font-heading text-[10.5px] leading-tight tracking-[0.14em] text-white/60 uppercase">
					Admin
					<br />
					Viver da Graça
				</span>
			</div>

			<nav className="mt-5.5 flex flex-col gap-0.75 font-sans text-[13px]">
				{NAV_ITEMS.map((item) => {
					const isActive = active === 'areas' && item === 'Áreas';
					return (
						<span
							key={item}
							className={cn(
								'rounded-md px-3.25 py-2.75',
								isActive ? 'bg-white/7' : 'text-white/50',
							)}
						>
							{item}
						</span>
					);
				})}
			</nav>
		</div>
	);
}

export { AdminSidebar };
