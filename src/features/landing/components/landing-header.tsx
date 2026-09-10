import Image from 'next/image';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { ThemeToggle } from '@/components/theme-toggle';

function LandingHeader() {
	return (
		<header className="flex items-center justify-between border-b border-foreground/8 px-5 py-4 sm:px-11 sm:py-5">
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

				<div aria-hidden className="flex flex-col gap-1 sm:hidden">
					<span className="h-px w-5 bg-foreground/70" />
					<span className="h-px w-5 bg-foreground/70" />
				</div>
			</div>
		</header>
	);
}

export { LandingHeader };
