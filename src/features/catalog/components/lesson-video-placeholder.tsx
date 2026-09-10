function LessonVideoPlaceholder() {
	return (
		<div
			className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-black"
			style={{
				backgroundImage:
					'repeating-linear-gradient(135deg, var(--surface-2) 0 10px, var(--stripe-2) 10px 20px)',
			}}
		>
			<div className="flex flex-col items-center gap-2 text-foreground/35">
				<span aria-hidden className="font-heading text-2xl font-extralight">
					⎘
				</span>
				<span className="font-sans text-[13px] font-light">
					Player em breve
				</span>
			</div>
		</div>
	);
}

export { LessonVideoPlaceholder };
