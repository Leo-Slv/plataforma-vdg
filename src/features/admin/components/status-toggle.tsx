'use client';

import { cn } from '@/lib/utils';

type StatusToggleProps = {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	helperText?: string;
};

function StatusToggle({
	label,
	checked,
	onChange,
	disabled = false,
	helperText,
}: StatusToggleProps) {
	return (
		<div className="flex items-center justify-between gap-4 rounded-md border border-foreground/10 p-5">
			<div>
				<span className="font-sans text-[13.5px] font-light text-foreground">
					{label}
				</span>
				{helperText ? (
					<div className="mt-1 font-sans text-[11.5px] font-light text-foreground/40">
						{helperText}
					</div>
				) : null}
			</div>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				disabled={disabled}
				onClick={() => onChange(!checked)}
				className={cn(
					'flex h-5.5 w-9.5 flex-none items-center rounded-full p-0.5 transition-colors',
					checked
						? 'justify-end bg-[oklch(0.62_0.14_255)] dark:bg-[oklch(0.62_0.1_248)]'
						: 'justify-start bg-foreground/15',
					disabled && 'opacity-60',
				)}
			>
				<span className="size-4.5 rounded-full bg-white dark:bg-foreground" />
			</button>
		</div>
	);
}

export { StatusToggle };
