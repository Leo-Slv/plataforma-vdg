'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
	return (
		<Sonner
			theme="dark"
			position="top-right"
			toastOptions={{
				unstyled: true,
				classNames: {
					toast:
						'flex w-full items-center gap-3 rounded-md border border-[oklch(0.62_0.1_248)] bg-[#0a0a0b] px-4 py-3.5 font-sans text-[13.5px] font-light text-[#f2f2f0] shadow-[0_12px_30px_rgba(0,0,0,0.5)]',
					title: 'font-sans text-[13.5px] font-normal text-[#f2f2f0]',
					description: 'font-sans text-[12.5px] font-light text-white/55',
					actionButton:
						'rounded-full bg-[#f4f4f2] px-3 py-1.5 text-[12px] text-[#0a0a0b]',
					cancelButton:
						'rounded-full border border-white/20 px-3 py-1.5 text-[12px] text-white/70',
					closeButton:
						'border border-white/15 bg-[#141416] text-white/60 hover:text-[#f2f2f0]',
					error: 'border-[oklch(0.704_0.191_22.216)]',
				},
			}}
			{...props}
		/>
	);
}

export { Toaster };
