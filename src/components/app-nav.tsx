'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes/app-routes';
import { getUserEmail } from '@/lib/auth/access-token';
import { authPermissions } from '@/lib/auth/auth-permissions';
import { decodeAccessTokenClaims, hasPermission } from '@/lib/auth/jwt-claims';
import { performLogout } from '@/lib/auth/logout';
import { logoutUser } from '@/features/auth/api/logout';

type AppNavProps = {
	displayName: string;
	initials: string;
	active: 'catalog' | 'my-courses';
};

const ADMIN_PANEL_PERMISSIONS = [
	authPermissions.manageCourses,
	authPermissions.manageAreas,
	authPermissions.manageUsers,
	authPermissions.manageVideos,
	authPermissions.readAudit,
];

function AppNav({ displayName, initials, active }: AppNavProps) {
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setMenuOpen(false);
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
		<header className="relative flex items-center justify-between border-b border-white/8 px-5 py-4.5 sm:px-10">
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
					{canSeeAdminPanel ? (
						<Link
							href={appRoutes.admin.courses}
							className="pb-0.5 text-white/50"
						>
							Painel admin
						</Link>
					) : null}
				</nav>
			</div>

			<div className="flex items-center gap-3.5">
				{displayName ? (
					<span className="hidden font-sans text-xs font-light text-white/45 sm:inline">
						{displayName}
					</span>
				) : null}
				<button
					type="button"
					onClick={() => setMenuOpen((current) => !current)}
					aria-haspopup="menu"
					aria-expanded={menuOpen}
					className="flex size-7.5 items-center justify-center rounded-full bg-[#22222a] font-heading text-xs"
				>
					{initials}
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
						className="absolute top-[calc(100%+8px)] right-5 z-50 w-[260px] overflow-hidden rounded-[10px] border border-white/10 bg-[#141416] shadow-[0_12px_30px_rgba(0,0,0,0.5)] sm:right-10"
					>
						<div className="flex items-center gap-3 border-b border-white/8 p-4.5">
							<span className="flex size-9.5 flex-none items-center justify-center rounded-full bg-[#22222a] font-heading text-xs">
								{initials}
							</span>
							<div className="min-w-0">
								<div className="truncate font-sans text-[13.5px] text-[#f2f2f0]">
									{displayName}
								</div>
								{email ? (
									<div className="truncate font-sans text-[11.5px] font-light text-white/42">
										{email}
									</div>
								) : null}
							</div>
						</div>
						<div className="flex flex-col p-2">
							<Link
								href={appRoutes.profile.index}
								onClick={() => setMenuOpen(false)}
								className="rounded-md px-2.5 py-2.75 font-sans text-[13.5px] text-white/55 hover:bg-white/5"
							>
								Editar perfil
							</Link>
							<span className="rounded-md px-2.5 py-2.75 font-sans text-[13.5px] text-white/55">
								Certificados
							</span>
						</div>
						<div className="border-t border-white/8 p-2">
							<button
								type="button"
								onClick={handleLogout}
								className="w-full rounded-md px-2.5 py-2.75 text-left font-sans text-[13.5px] text-white/70 hover:bg-white/5"
							>
								Sair
							</button>
						</div>
					</div>
				</>
			) : null}
		</header>
	);
}

export { AppNav };
