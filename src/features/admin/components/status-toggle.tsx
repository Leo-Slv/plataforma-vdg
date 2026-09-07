'use client';

import { cn } from '@/lib/utils';

type StatusToggleProps = {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
};

function StatusToggle({ label, checked, onChange }: StatusToggleProps) {
	return (
		<div className="flex items-center justify-between rounded-md border border-white/10 p-5">
			<span className="font-sans text-[13.5px] font-light text-[#f2f2f0]">
				{label}
			</span>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				onClick={() => onChange(!checked)}
				className={cn(
					'flex h-5.5 w-9.5 items-center rounded-full p-0.5 transition-colors',
					checked
						? 'justify-end bg-[oklch(0.62_0.1_248)]'
						: 'justify-start bg-white/15',
				)}
			>
				<span className="size-4.5 rounded-full bg-white" />
			</button>
		</div>
	);
}

export { StatusToggle };
