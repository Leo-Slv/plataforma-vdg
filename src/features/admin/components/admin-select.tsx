'use client';

import { useId, type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type AdminSelectProps = ComponentProps<'select'> & {
	label: string;
	error?: string;
};

function AdminSelect({
	label,
	error,
	id,
	className,
	children,
	...selectProps
}: AdminSelectProps) {
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
			<select
				id={fieldId}
				className={cn(
					'w-full rounded-md border border-white/12 bg-[#141416] px-4 py-3.25 font-sans text-[14px] font-light text-[#f2f2f0] outline-none focus:border-[oklch(0.62_0.1_248)]',
					className,
				)}
				aria-invalid={Boolean(error)}
				{...selectProps}
			>
				{children}
			</select>
			{error ? (
				<p className="mt-2 text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
					{error}
				</p>
			) : null}
		</div>
	);
}

export { AdminSelect };
