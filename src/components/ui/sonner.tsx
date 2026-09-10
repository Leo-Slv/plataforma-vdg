'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
	const { resolvedTheme } = useTheme();

	return (
		<Sonner
			theme={resolvedTheme === 'light' ? 'light' : 'dark'}
			position="top-right"
			toastOptions={{
				unstyled: true,
				classNames: {
					toast:
						'flex w-full items-center gap-3 rounded-md border border-[oklch(0.62_0.1_248)] bg-background px-4 py-3.5 font-sans text-[13.5px] font-light text-foreground shadow-[0_12px_30px_rgba(0,0,0,0.5)]',
					title: 'font-sans text-[13.5px] font-normal text-foreground',
					description: 'font-sans text-[12.5px] font-light text-foreground/55',
					actionButton:
						'rounded-full bg-foreground px-3 py-1.5 text-[12px] text-background',
					cancelButton:
						'rounded-full border border-foreground/20 px-3 py-1.5 text-[12px] text-foreground/70',
					closeButton:
						'border border-foreground/15 bg-surface-2 text-foreground/60 hover:text-foreground',
					error: 'border-[oklch(0.704_0.191_22.216)]',
				},
			}}
			{...props}
		/>
	);
}

export { Toaster };
