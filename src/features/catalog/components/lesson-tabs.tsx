import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type LessonTab = 'material' | 'notes' | 'questions';

type LessonTabsProps = {
	active: LessonTab;
	onSelect: (tab: LessonTab) => void;
	children: ReactNode;
};

const TAB_LABELS: { key: LessonTab; label: string }[] = [
	{ key: 'material', label: 'Material' },
	{ key: 'notes', label: 'Anotações' },
	{ key: 'questions', label: 'Perguntas' },
];

function LessonTabs({ active, onSelect, children }: LessonTabsProps) {
	return (
		<div className="mt-8 border-t border-foreground/9 pt-4">
			<div
				role="tablist"
				className="flex gap-7 font-sans text-[13px] text-foreground/45"
			>
				{TAB_LABELS.map((tab) => (
					<button
						key={tab.key}
						type="button"
						role="tab"
						aria-selected={active === tab.key}
						onClick={() => onSelect(tab.key)}
						className={cn(
							'pb-2.5',
							active === tab.key
								? 'border-b border-foreground text-foreground'
								: 'border-b border-transparent',
						)}
					>
						{tab.label}
					</button>
				))}
			</div>
			<div className="mt-5">{children}</div>
		</div>
	);
}

export { LessonTabs };
export type { LessonTab };
