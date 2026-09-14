function LessonMaterialPanel() {
	return (
		<div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-foreground/15 py-10 text-center text-foreground/35">
			<span aria-hidden className="font-heading text-2xl font-extralight">
				⎘
			</span>
			<span className="font-sans text-[13px] font-light">Em breve</span>
		</div>
	);
}

export { LessonMaterialPanel };
