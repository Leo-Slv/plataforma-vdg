import Image from 'next/image';

import { footerContent } from '@/features/landing/lib/landing-content';

function LandingFooter() {
	return (
		<footer className="flex flex-col items-start gap-6 border-t border-white/8 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-11 sm:py-16">
			<div className="flex items-center gap-3.5">
				<Image
					src="/brand/viver-da-graca-mark.png"
					alt=""
					aria-hidden
					width={44}
					height={44}
					className="size-11 rounded-full object-cover"
				/>
				<div className="text-xs leading-[1.7] font-light text-white/40">
					{footerContent.orgName}
					<br />
					{footerContent.schoolName}
				</div>
			</div>

			<div className="text-xs leading-[1.7] font-light text-white/40 sm:text-right">
				{footerContent.linkLabels.join(' · ')}
				<br />© {footerContent.copyrightYear}
			</div>
		</footer>
	);
}

export { LandingFooter };
