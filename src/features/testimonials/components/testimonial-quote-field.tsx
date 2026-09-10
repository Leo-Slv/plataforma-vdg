'use client';

import { useId, type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type TestimonialQuoteFieldProps = ComponentProps<'textarea'> & {
	label: string;
	error?: string;
};

function TestimonialQuoteField({
	label,
	error,
	id,
	className,
	...textareaProps
}: TestimonialQuoteFieldProps) {
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
			<textarea
				id={fieldId}
				rows={5}
				className={cn(
					'w-full resize-none rounded-lg border border-foreground/18 bg-transparent px-3.5 py-3.5 font-sans text-[15px] leading-[1.6] font-light text-foreground outline-none placeholder:text-foreground/35 focus:border-[oklch(0.62_0.1_248)]',
					className,
				)}
				aria-invalid={Boolean(error)}
				{...textareaProps}
			/>
			{error ? (
				<p className="mt-2 text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
					{error}
				</p>
			) : null}
		</div>
	);
}

export { TestimonialQuoteField };
