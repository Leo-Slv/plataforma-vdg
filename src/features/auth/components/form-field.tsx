'use client';

import { useId, type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type FormFieldProps = ComponentProps<'input'> & {
	label: string;
	error?: string;
};

function FormField({
	label,
	error,
	id,
	className,
	...inputProps
}: FormFieldProps) {
	const generatedId = useId();
	const fieldId = id ?? generatedId;

	return (
		<div>
			<label
				htmlFor={fieldId}
				className="mb-2.25 block font-heading text-[11px] tracking-[0.14em] text-foreground/45 uppercase"
			>
				{label}
			</label>
			<input
				id={fieldId}
				className={cn(
					'w-full border-0 border-b border-foreground/18 bg-transparent py-3 font-sans text-[15px] font-light text-foreground outline-none placeholder:text-foreground/30 focus:border-[oklch(0.62_0.1_248)]',
					'autofill:shadow-[0_0_0px_1000px_var(--background)_inset] autofill:[-webkit-text-fill-color:var(--foreground)] autofill:[transition:background-color_9999s_ease-in-out_0s]',
					className,
				)}
				aria-invalid={Boolean(error)}
				{...inputProps}
			/>
			{error ? (
				<p className="mt-2 text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
					{error}
				</p>
			) : null}
		</div>
	);
}

export { FormField };
