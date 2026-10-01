'use client';

import { useId, type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type VisitorInputFieldProps = ComponentProps<'input'> & {
	label: string;
	hint?: string;
	invalid?: boolean;
};

// Boxed, rounded input from the "Primeira Vez" mockup — a different look
// from the auth screens' underline FormField. The fill flips by breakpoint:
// surface on mobile, page background inside the desktop card.
function VisitorInputField({
	label,
	hint,
	invalid = false,
	id,
	className,
	...inputProps
}: VisitorInputFieldProps) {
	const generatedId = useId();
	const fieldId = id ?? generatedId;

	return (
		<div className="flex min-w-0 flex-col gap-2">
			<label
				htmlFor={fieldId}
				className="flex justify-between font-heading text-[11px] leading-none tracking-[0.16em] text-foreground/55 uppercase"
			>
				<span>{label}</span>
				{hint ? <span className="text-foreground/30">{hint}</span> : null}
			</label>
			<input
				id={fieldId}
				className={cn(
					'w-full min-w-0 rounded-[10px] border border-foreground/12 bg-surface p-4 font-sans text-[16px] leading-[1.3] text-foreground outline-none placeholder:text-foreground/30 focus:border-[oklch(0.62_0.1_248)] lg:bg-background lg:px-4 lg:py-[15px] lg:text-[15px]',
					'autofill:shadow-[0_0_0px_1000px_var(--surface)_inset] autofill:[-webkit-text-fill-color:var(--foreground)] autofill:[transition:background-color_9999s_ease-in-out_0s] lg:autofill:shadow-[0_0_0px_1000px_var(--background)_inset]',
					invalid && 'border-[oklch(0.65_0.12_30)]',
					className,
				)}
				aria-invalid={invalid}
				{...inputProps}
			/>
		</div>
	);
}

export { VisitorInputField };
