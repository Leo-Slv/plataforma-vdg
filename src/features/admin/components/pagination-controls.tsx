type PaginationControlsProps = {
	page: number;
	totalPages: number;
	onPrevious: () => void;
	onNext: () => void;
};

function PaginationControls({
	page,
	totalPages,
	onPrevious,
	onNext,
}: PaginationControlsProps) {
	return (
		<div className="mt-6 flex items-center justify-center gap-5">
			<button
				type="button"
				onClick={onPrevious}
				disabled={page <= 1}
				className="rounded-full border border-foreground/18 px-5 py-2.5 font-sans text-[12.5px] text-foreground/60 disabled:opacity-30"
			>
				Anterior
			</button>
			<span className="font-sans text-[12.5px] font-light text-foreground/40">
				Página {page} de {Math.max(totalPages, 1)}
			</span>
			<button
				type="button"
				onClick={onNext}
				disabled={page >= totalPages}
				className="rounded-full border border-foreground/18 px-5 py-2.5 font-sans text-[12.5px] text-foreground/60 disabled:opacity-30"
			>
				Próxima
			</button>
		</div>
	);
}

export { PaginationControls };
