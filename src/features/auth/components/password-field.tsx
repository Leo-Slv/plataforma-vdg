'use client';

import { useId, useState, type ComponentProps, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { passwordStrengthSegments } from '@/features/auth/lib/password-strength';

type PasswordFieldProps = Omit<ComponentProps<'input'>, 'type'> & {
	label: string;
	value: string;
	error?: string;
	labelExtra?: ReactNode;
	showStrength?: boolean;
};

function PasswordField({
	label,
	value,
	error,
	labelExtra,
	showStrength = true,
	id,
	className,
	...inputProps
}: PasswordFieldProps) {
	const [visible, setVisible] = useState(false);
	const generatedId = useId();
	const fieldId = id ?? generatedId;
	const filledSegments = passwordStrengthSegments(value);

	return (
		<div>
			<div className="mb-2.25 flex items-center justify-between">
				<label
					htmlFor={fieldId}
					className="font-heading text-[11px] tracking-[0.14em] text-white/45 uppercase"
				>
					{label}
				</label>
				{labelExtra}
			</div>
			<div
				className={cn(
					'flex items-center justify-between border-b border-white/18 py-3 has-focus-within:border-[oklch(0.62_0.1_248)]',
				)}
			>
				<input
					id={fieldId}
					type={visible ? 'text' : 'password'}
					value={value}
					className={cn(
						'w-full border-0 bg-transparent font-sans text-[15px] font-light tracking-[0.2em] text-[#f2f2f0] outline-none',
						'autofill:shadow-[0_0_0px_1000px_#0a0a0b_inset] autofill:[-webkit-text-fill-color:#f2f2f0] autofill:[transition:background-color_9999s_ease-in-out_0s]',
						className,
					)}
					aria-invalid={Boolean(error)}
					{...inputProps}
				/>
				<button
					type="button"
					onClick={() => setVisible((current) => !current)}
					className="shrink-0 font-sans text-[11px] text-white/40"
				>
					{visible ? 'ocultar' : 'mostrar'}
				</button>
			</div>

			{showStrength ? (
				<div className="mt-2.5 flex gap-1.25">
					{Array.from({ length: 4 }, (_, index) => (
						<span
							key={index}
							className={cn(
								'h-0.5 flex-1 rounded-full',
								index < filledSegments
									? 'bg-[oklch(0.62_0.1_248)]'
									: 'bg-white/14',
							)}
						/>
					))}
				</div>
			) : null}

			{error ? (
				<p className="mt-2 text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
					{error}
				</p>
			) : showStrength ? (
				<p className="mt-2 text-[11.5px] font-light text-white/40">
					Mínimo de 12 caracteres.
				</p>
			) : null}
		</div>
	);
}

export { PasswordField };
