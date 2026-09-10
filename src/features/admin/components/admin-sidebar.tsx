import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes/app-routes';

type AdminSidebarProps = {
	active: 'areas' | 'courses' | 'users' | 'videos' | 'audit';
	areasSummary?: { name: string; courseCount: number }[];
};

const NAV_ITEMS = [
	{ label: 'Cursos', key: 'courses', href: appRoutes.admin.courses },
	{ label: 'Áreas', key: 'areas', href: appRoutes.admin.areas },
	{ label: 'Usuários', key: 'users', href: appRoutes.admin.users },
	{ label: 'Vídeos', key: 'videos', href: appRoutes.admin.videos },
	{ label: 'Auditoria', key: 'audit', href: appRoutes.admin.audit },
] as const;

function AdminSidebar({ active, areasSummary }: AdminSidebarProps) {
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
				{NAV_ITEMS.map((item) => (
					<Link
						key={item.key}
						href={item.href}
						className={cn(
							'rounded-md px-3.25 py-2.75',
							active === item.key ? 'bg-white/7' : 'text-white/50',
						)}
					>
						{item.label}
					</Link>
				))}
			</nav>

			{areasSummary && areasSummary.length > 0 ? (
				<div className="mt-7 border-t border-white/8 pt-5">
					<span className="font-heading text-[10px] tracking-[0.16em] text-white/35 uppercase">
						Áreas ativas
					</span>
					<div className="mt-4 flex flex-col gap-3 font-sans text-[12.5px] text-white/55">
						{areasSummary.map((area) => (
							<div key={area.name} className="flex justify-between">
								<span>{area.name}</span>
								<span className="text-white/30">{area.courseCount}</span>
							</div>
						))}
					</div>
				</div>
			) : null}
		</div>
	);
}

export { AdminSidebar };
