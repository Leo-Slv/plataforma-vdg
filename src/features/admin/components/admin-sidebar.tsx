'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ListIcon, XIcon } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes/app-routes';
import { ThemeToggle } from '@/components/theme-toggle';

type AdminSidebarProps = {
	active: 'areas' | 'courses' | 'users' | 'videos' | 'audit' | 'testimonials';
	areasSummary?: { name: string; courseCount: number }[];
};

const NAV_ITEMS = [
	{ label: 'Cursos', key: 'courses', href: appRoutes.admin.courses },
	{ label: 'Áreas', key: 'areas', href: appRoutes.admin.areas },
	{ label: 'Usuários', key: 'users', href: appRoutes.admin.users },
	{ label: 'Vídeos', key: 'videos', href: appRoutes.admin.videos },
	{ label: 'Auditoria', key: 'audit', href: appRoutes.admin.audit },
	{
		label: 'Depoimentos',
		key: 'testimonials',
		href: appRoutes.admin.testimonials,
	},
] as const;

type SidebarContentProps = AdminSidebarProps & { onNavigate?: () => void };

function SidebarContent({
	active,
	areasSummary,
	onNavigate,
}: SidebarContentProps) {
	return (
		<>
			<nav className="mt-5.5 flex flex-col gap-0.75 font-sans text-[13px]">
				{NAV_ITEMS.map((item) => (
					<Link
						key={item.key}
						href={item.href}
						onClick={onNavigate}
						className={cn(
							'rounded-md px-3.25 py-2.75',
							active === item.key ? 'bg-foreground/7' : 'text-foreground/50',
						)}
					>
						{item.label}
					</Link>
				))}
			</nav>

			<div className="mt-5.5 border-t border-foreground/8 pt-4.5">
				<Link
					href={appRoutes.catalog.index}
					onClick={onNavigate}
					className="flex items-center gap-2 font-sans text-[12.5px] font-light text-foreground/45"
				>
					← Voltar à plataforma
				</Link>
			</div>

			{areasSummary && areasSummary.length > 0 ? (
				<div className="mt-7 border-t border-foreground/8 pt-5">
					<span className="font-heading text-[10px] tracking-[0.16em] text-foreground/35 uppercase">
						Áreas ativas
					</span>
					<div className="mt-4 flex flex-col gap-3 font-sans text-[12.5px] text-foreground/55">
						{areasSummary.map((area) => (
							<div key={area.name} className="flex justify-between">
								<span>{area.name}</span>
								<span className="text-foreground/30">{area.courseCount}</span>
							</div>
						))}
					</div>
				</div>
			) : null}
		</>
	);
}

function AdminSidebar({ active, areasSummary }: AdminSidebarProps) {
	const [drawerOpen, setDrawerOpen] = useState(false);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setDrawerOpen(false);
			}
		}
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	return (
		<>
			<div className="flex items-center justify-between gap-2.75 border-b border-foreground/8 p-4 lg:hidden">
				<div className="flex items-center gap-2.75">
					<Image
						src="/brand/viver-da-graca-mark.png"
						alt="Viver da Graça"
						width={28}
						height={28}
						className="size-7 rounded-full object-cover"
					/>
					<span className="font-heading text-[10.5px] leading-tight tracking-[0.14em] text-foreground/60 uppercase">
						Admin
						<br />
						Viver da Graça
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<ThemeToggle />
					<button
						type="button"
						onClick={() => setDrawerOpen(true)}
						aria-haspopup="menu"
						aria-expanded={drawerOpen}
						aria-label="Abrir menu admin"
						className="flex size-7.5 items-center justify-center rounded-full text-foreground/50 hover:bg-foreground/6 hover:text-foreground"
					>
						<ListIcon className="size-4.5" />
					</button>
				</div>
			</div>

			<div className="hidden border-r border-foreground/8 p-5 lg:block">
				<div className="flex items-center justify-between gap-2.75 border-b border-foreground/8 pb-6">
					<div className="flex items-center gap-2.75">
						<Image
							src="/brand/viver-da-graca-mark.png"
							alt="Viver da Graça"
							width={28}
							height={28}
							className="size-7 rounded-full object-cover"
						/>
						<span className="font-heading text-[10.5px] leading-tight tracking-[0.14em] text-foreground/60 uppercase">
							Admin
							<br />
							Viver da Graça
						</span>
					</div>
					<ThemeToggle />
				</div>

				<SidebarContent active={active} areasSummary={areasSummary} />
			</div>

			{drawerOpen ? (
				<>
					<div
						className="fixed inset-0 z-40 bg-black/40 lg:hidden"
						onClick={() => setDrawerOpen(false)}
					/>
					<div
						role="menu"
						className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] overflow-y-auto border-r border-foreground/8 bg-surface-2 p-5 lg:hidden"
					>
						<div className="flex items-center justify-between gap-2.75 border-b border-foreground/8 pb-6">
							<div className="flex items-center gap-2.75">
								<Image
									src="/brand/viver-da-graca-mark.png"
									alt="Viver da Graça"
									width={28}
									height={28}
									className="size-7 rounded-full object-cover"
								/>
								<span className="font-heading text-[10.5px] leading-tight tracking-[0.14em] text-foreground/60 uppercase">
									Admin
									<br />
									Viver da Graça
								</span>
							</div>
							<button
								type="button"
								onClick={() => setDrawerOpen(false)}
								aria-label="Fechar menu"
								className="flex size-7.5 items-center justify-center rounded-full text-foreground/50 hover:bg-foreground/6 hover:text-foreground"
							>
								<XIcon className="size-4" />
							</button>
						</div>

						<SidebarContent
							active={active}
							areasSummary={areasSummary}
							onNavigate={() => setDrawerOpen(false)}
						/>
					</div>
				</>
			) : null}
		</>
	);
}

export { AdminSidebar };
