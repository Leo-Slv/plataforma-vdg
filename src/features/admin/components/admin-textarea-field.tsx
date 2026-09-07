'use client';

import { useId, type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type AdminTextareaFieldProps = ComponentProps<'textarea'> & {
	label: string;
	error?: string;
};

function AdminTextareaField({
	label,
	error,
	id,
	className,
	...textareaProps
}: AdminTextareaFieldProps) {
	const generatedId = useId();
	const fieldId = id ?? generatedId;

	return (
		<div>
			<label
				htmlFor={fieldId}
				className="mb-2.25 block font-heading text-[10px] tracking-[0.14em] text-white/40 uppercase"
			>
				{label}
			</label>
			<textarea
				id={fieldId}
				rows={4}
				className={cn(
					'w-full resize-none rounded-md border border-white/12 bg-[#141416] px-4 py-3.25 font-sans text-[14px] leading-[1.6] font-light text-[#f2f2f0] outline-none focus:border-[oklch(0.62_0.1_248)]',
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

export { AdminTextareaField };
