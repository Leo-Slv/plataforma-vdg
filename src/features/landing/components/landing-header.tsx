'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { XIcon } from '@phosphor-icons/react';

import { appRoutes } from '@/lib/routes/app-routes';
import { ThemeToggle } from '@/components/theme-toggle';

function LandingHeader() {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<header className="relative flex items-center justify-between border-b border-foreground/8 px-5 py-4 sm:px-11 sm:py-5">
			<div className="flex items-center gap-3">
				<Image
					src="/brand/viver-da-graca-mark.png"
					alt="Viver da Graça"
					width={36}
					height={36}
					className="size-[30px] rounded-full object-cover sm:size-9"
				/>
				<span className="hidden font-heading text-[13px] font-light tracking-[0.18em] uppercase sm:inline">
					Viver da Graça
				</span>
			</div>

			<div className="flex items-center gap-3">
				<ThemeToggle />

				<div className="hidden items-center gap-3 sm:flex">
					<Link
						href={appRoutes.auth.login}
						className="px-1 py-2.5 text-[13px] text-foreground/70"
					>
						Entrar
					</Link>
					<Link
						href={appRoutes.auth.register}
						className="rounded-full bg-foreground px-5 py-2.5 text-[13px] text-background"
					>
						Criar conta
					</Link>
				</div>

				<button
					type="button"
					onClick={() => setMenuOpen((current) => !current)}
					aria-haspopup="menu"
					aria-expanded={menuOpen}
					aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
					className="flex size-7.5 flex-col items-center justify-center gap-1 sm:hidden"
				>
					{menuOpen ? (
						<XIcon className="size-4.5" />
					) : (
						<>
							<span className="h-px w-5 bg-foreground/70" />
							<span className="h-px w-5 bg-foreground/70" />
						</>
					)}
				</button>
			</div>

			{menuOpen ? (
				<>
					<div
						className="fixed inset-0 z-40 sm:hidden"
						onClick={() => setMenuOpen(false)}
					/>
					<div
						role="menu"
						className="absolute top-full right-5 left-5 z-50 mt-2 flex flex-col gap-2 rounded-[10px] border border-foreground/10 bg-surface-2 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.35)] sm:hidden"
					>
						<Link
							href={appRoutes.auth.login}
							onClick={() => setMenuOpen(false)}
							className="rounded-md px-3 py-2.75 text-center text-[13px] text-foreground/70 hover:bg-foreground/5"
						>
							Entrar
						</Link>
						<Link
							href={appRoutes.auth.register}
							onClick={() => setMenuOpen(false)}
							className="rounded-full bg-foreground px-5 py-2.75 text-center text-[13px] text-background"
						>
							Criar conta
						</Link>
					</div>
				</>
			) : null}
		</header>
	);
}

export { LandingHeader };
