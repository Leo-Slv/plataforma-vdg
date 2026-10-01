import Image from 'next/image';

import { SERVICE_TIMES } from '@/features/visitors/lib/first-visit-messages';

function FirstVisitHeader() {
	return (
		<header className="flex items-center justify-between border-b border-foreground/8 px-5.5 py-4.5 lg:px-11 lg:py-5">
			<div className="flex items-center gap-2.5 lg:gap-3">
				<Image
					src="/brand/viver-da-graca-mark.png"
					alt="Viver da Graça"
					width={36}
					height={36}
					className="size-8 rounded-full object-cover lg:size-9"
				/>
				<span className="font-heading text-[12px] leading-none font-light tracking-[0.18em] uppercase lg:text-[13px]">
					Viver da Graça
				</span>
			</div>
			<span className="hidden text-[13px] leading-none text-foreground/55 lg:inline">
				{SERVICE_TIMES}
			</span>
		</header>
	);
}

export { FirstVisitHeader };
