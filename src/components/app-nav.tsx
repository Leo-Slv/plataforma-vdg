'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { XIcon } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes/app-routes';
import { getUserEmail } from '@/lib/auth/access-token';
import { authPermissions } from '@/lib/auth/auth-permissions';
import { decodeAccessTokenClaims, hasPermission } from '@/lib/auth/jwt-claims';
import { performLogout } from '@/lib/auth/logout';
import { logoutUser } from '@/features/auth/api/logout';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserAvatar } from '@/components/user-avatar';

type AppNavProps = {
	displayName: string;
	initials: string;
	avatarUrl: string | null;
	active: 'catalog' | 'my-courses';
};

const ADMIN_PANEL_PERMISSIONS = [
	authPermissions.manageCourses,
	authPermissions.manageAreas,
	authPermissions.manageUsers,
	authPermissions.manageVideos,
	authPermissions.readAudit,
];

function AppNav({ displayName, initials, avatarUrl, active }: AppNavProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [navOpen, setNavOpen] = useState(false);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setMenuOpen(false);
				setNavOpen(false);
			}
		}
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	const email = getUserEmail();
	const claims = decodeAccessTokenClaims();
	const canSeeAdminPanel = ADMIN_PANEL_PERMISSIONS.some((permission) =>
		hasPermission(claims, permission),
	);

	function handleLogout() {
		performLogout(() => logoutUser());
	}

	return (
		<header className="relative flex items-center justify-between border-b border-foreground/8 px-5 py-4.5 sm:px-10">
			<div className="flex items-center gap-8.5">
				<button
					type="button"
					onClick={() => setNavOpen(true)}
					aria-haspopup="menu"
					aria-expanded={navOpen}
					aria-label="Abrir menu de navegação"
					className="sm:cursor-default"
				>
					<Image
						src="/brand/viver-da-graca-mark.png"
						alt="Viver da Graça"
						width={32}
						height={32}
						className="size-8 rounded-full object-cover"
					/>
				</button>
				<nav className="hidden items-center gap-7 font-sans text-[13px] sm:flex">
					<Link
						href={appRoutes.catalog.index}
						className={cn(
							'pb-0.5',
							active === 'catalog'
								? 'border-b border-foreground text-foreground'
								: 'text-foreground/50',
						)}
					>
						Catálogo
					</Link>
					<Link
						href={appRoutes.myCourses.index}
						className={cn(
							'pb-0.5',
							active === 'my-courses'
								? 'border-b border-foreground text-foreground'
								: 'text-foreground/50',
						)}
					>
						Meus cursos
					</Link>
					<span className="text-foreground/50">Certificados</span>
					{canSeeAdminPanel ? (
						<Link
							href={appRoutes.admin.courses}
							className="pb-0.5 text-foreground/50"
						>
							Painel admin
						</Link>
					) : null}
				</nav>
			</div>

			<div className="flex items-center gap-3.5">
				{displayName ? (
					<span className="hidden font-sans text-xs font-light text-foreground/45 sm:inline">
						{displayName}
					</span>
				) : null}
				<ThemeToggle />
				<button
					type="button"
					onClick={() => setMenuOpen((current) => !current)}
					aria-haspopup="menu"
					aria-expanded={menuOpen}
					className="rounded-full"
				>
					<UserAvatar
						avatarUrl={avatarUrl}
						initials={initials}
						className="size-7.5 font-heading text-xs"
					/>
				</button>
			</div>

			{menuOpen ? (
				<>
					<div
						className="fixed inset-0 z-40"
						onClick={() => setMenuOpen(false)}
					/>
					<div
						role="menu"
						className="absolute top-[calc(100%+8px)] right-5 z-50 w-[260px] overflow-hidden rounded-[10px] border border-foreground/10 bg-surface-2 shadow-[0_12px_30px_rgba(0,0,0,0.5)] sm:right-10"
					>
						<div className="flex items-center gap-3 border-b border-foreground/8 p-4.5">
							<UserAvatar
								avatarUrl={avatarUrl}
								initials={initials}
								className="size-9.5 font-heading text-xs"
							/>
							<div className="min-w-0">
								<div className="truncate font-sans text-[13.5px] text-foreground">
									{displayName}
								</div>
								{email ? (
									<div className="truncate font-sans text-[11.5px] font-light text-foreground/42">
										{email}
									</div>
								) : null}
							</div>
						</div>
						<div className="flex flex-col p-2">
							<Link
								href={appRoutes.profile.index}
								onClick={() => setMenuOpen(false)}
								className="rounded-md px-2.5 py-2.75 font-sans text-[13.5px] text-foreground/55 hover:bg-foreground/5"
							>
								Editar perfil
							</Link>
							<span className="rounded-md px-2.5 py-2.75 font-sans text-[13.5px] text-foreground/55">
								Certificados
							</span>
						</div>
						<div className="border-t border-foreground/8 p-2">
							<button
								type="button"
								onClick={handleLogout}
								className="w-full rounded-md px-2.5 py-2.75 text-left font-sans text-[13.5px] text-foreground/70 hover:bg-foreground/5"
							>
								Sair
							</button>
						</div>
					</div>
				</>
			) : null}

			{navOpen ? (
				<>
					<div
						className="fixed inset-0 z-40 bg-black/40"
						onClick={() => setNavOpen(false)}
					/>
					<div
						role="menu"
						className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[80vw] flex-col border-r border-foreground/10 bg-surface-2 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Image
									src="/brand/viver-da-graca-mark.png"
									alt="Viver da Graça"
									width={32}
									height={32}
									className="size-8 rounded-full object-cover"
								/>
								<span className="font-heading text-[12px] font-light tracking-[0.16em] uppercase">
									Viver da Graça
								</span>
							</div>
							<button
								type="button"
								onClick={() => setNavOpen(false)}
								aria-label="Fechar menu"
								className="flex size-7.5 items-center justify-center rounded-full text-foreground/50 hover:bg-foreground/6 hover:text-foreground"
							>
								<XIcon className="size-4" />
							</button>
						</div>

						<nav className="mt-8 flex flex-col gap-1 font-sans text-[14px]">
							<Link
								href={appRoutes.catalog.index}
								onClick={() => setNavOpen(false)}
								className={cn(
									'rounded-md px-2.5 py-2.75',
									active === 'catalog'
										? 'bg-foreground/6 text-foreground'
										: 'text-foreground/55 hover:bg-foreground/5',
								)}
							>
								Catálogo
							</Link>
							<Link
								href={appRoutes.myCourses.index}
								onClick={() => setNavOpen(false)}
								className={cn(
									'rounded-md px-2.5 py-2.75',
									active === 'my-courses'
										? 'bg-foreground/6 text-foreground'
										: 'text-foreground/55 hover:bg-foreground/5',
								)}
							>
								Meus cursos
							</Link>
							<span className="rounded-md px-2.5 py-2.75 text-foreground/55">
								Certificados
							</span>
							{canSeeAdminPanel ? (
								<Link
									href={appRoutes.admin.courses}
									onClick={() => setNavOpen(false)}
									className="rounded-md px-2.5 py-2.75 text-foreground/55 hover:bg-foreground/5"
								>
									Painel admin
								</Link>
							) : null}
						</nav>
					</div>
				</>
			) : null}
		</header>
	);
}

export { AppNav };
