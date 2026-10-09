import Image from 'next/image';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import {
	LEGAL_DRAFT_NOTICE,
	type LegalDocument,
} from '@/features/legal/lib/legal-content';

type LegalPageProps = {
	document: LegalDocument;
};

function LegalPage({ document }: LegalPageProps) {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="flex items-center justify-between border-b border-foreground/8 px-5 py-4.5 sm:px-10">
				<Link href={appRoutes.system.home} aria-label="Voltar ao início">
					<Image
						src="/brand/viver-da-graca-mark.png"
						alt="Viver da Graça"
						width={32}
						height={32}
						className="size-8 rounded-full object-cover"
					/>
				</Link>
				<nav className="flex gap-6 font-sans text-[13px] text-foreground/55">
					<Link href={appRoutes.legal.terms}>Termos</Link>
					<Link href={appRoutes.legal.privacy}>Privacidade</Link>
				</nav>
			</header>

			<main className="mx-auto max-w-[720px] px-5 py-12 sm:px-6">
				<h1 className="font-heading text-[38px] leading-[1.1] font-extralight">
					{document.title}
				</h1>
				<p
					role="note"
					className="mt-5 rounded-md border border-foreground/12 bg-surface px-4 py-3 text-[12.5px] font-light text-foreground/60"
				>
					{LEGAL_DRAFT_NOTICE}
				</p>
				<p className="mt-6 text-[15px] leading-[1.75] font-light text-foreground/65">
					{document.intro}
				</p>

				{document.sections.map((section) => (
					<section key={section.heading} className="mt-9">
						<h2 className="font-heading text-[20px] font-light">
							{section.heading}
						</h2>
						{section.paragraphs.map((paragraph) => (
							<p
								key={paragraph}
								className="mt-3 text-[15px] leading-[1.75] font-light text-foreground/60"
							>
								{paragraph}
							</p>
						))}
					</section>
				))}
			</main>
		</div>
	);
}

export { LegalPage };
