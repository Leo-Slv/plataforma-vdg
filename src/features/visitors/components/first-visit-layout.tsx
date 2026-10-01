'use client';

import { useState } from 'react';
import Image from 'next/image';

import { FirstVisitHero } from '@/features/visitors/components/first-visit-hero';
import { FirstVisitForm } from '@/features/visitors/components/first-visit-form';

// One form instance for every breakpoint (never two trees toggled by CSS,
// which would mount two forms and two Turnstile widgets) — layout
// differences between mockups 1a and 1b are all `lg:` classes.
function FirstVisitLayout() {
	const [submitted, setSubmitted] = useState(false);

	return (
		<main className="relative flex flex-1 flex-col overflow-hidden px-5.5 pt-8.5 pb-7.5 lg:grid lg:grid-cols-[1fr_520px] lg:items-center lg:gap-20 lg:px-11 lg:pt-20 lg:pb-22">
			<Image
				src="/brand/viver-da-graca-mark.png"
				alt=""
				aria-hidden
				width={560}
				height={560}
				className="pointer-events-none absolute -bottom-40 -left-35 hidden size-140 rounded-full object-cover opacity-10 lg:block"
			/>

			<FirstVisitHero hideIntroOnMobile={submitted} />

			<div className="relative lg:rounded-2xl lg:border lg:border-foreground/8 lg:bg-surface lg:p-10">
				<FirstVisitForm onSubmittedChange={setSubmitted} />
			</div>
		</main>
	);
}

export { FirstVisitLayout };
