'use client';

type ReorderButtonsProps = {
	canMoveUp: boolean;
	canMoveDown: boolean;
	onMoveUp: () => void;
	onMoveDown: () => void;
};

function ReorderButtons({
	canMoveUp,
	canMoveDown,
	onMoveUp,
	onMoveDown,
}: ReorderButtonsProps) {
	return (
		<div className="flex flex-col gap-0.5">
			<button
				type="button"
				onClick={onMoveUp}
				disabled={!canMoveUp}
				aria-label="Mover para cima"
				className="text-[11px] text-white/40 disabled:opacity-25"
			>
				▲
			</button>
			<button
				type="button"
				onClick={onMoveDown}
				disabled={!canMoveDown}
				aria-label="Mover para baixo"
				className="text-[11px] text-white/40 disabled:opacity-25"
			>
				▼
			</button>
		</div>
	);
}

export { ReorderButtons };
