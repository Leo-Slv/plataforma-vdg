'use client';

import { cn } from '@/lib/utils';
import {
	ACCENT_COLOR_OPTIONS,
	type AccentColorValue,
} from '@/features/admin/lib/accent-color';

type AccentColorPickerProps = {
	value: AccentColorValue;
	onChange: (value: AccentColorValue) => void;
};

function AccentColorPicker({ value, onChange }: AccentColorPickerProps) {
	return (
		<div>
			<span className="mb-2.25 block font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
				Cor de destaque
			</span>
			<div className="flex gap-2.5">
				{ACCENT_COLOR_OPTIONS.map((option) => (
					<button
						key={option.value}
						type="button"
						aria-label={option.value}
						aria-pressed={value === option.value}
						onClick={() => onChange(option.value)}
						style={{ background: option.oklch }}
						className={cn(
							'size-7.5 rounded-full',
							value === option.value
								? 'border-2 border-foreground'
								: 'border-2 border-transparent',
						)}
					/>
				))}
			</div>
		</div>
	);
}

export { AccentColorPicker };
