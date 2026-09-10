type AreaChipsProps = {
	status: 'admin' | 'pending' | 'error' | 'ready';
	names: string[];
};

function Chip({ children }: { children: string }) {
	return (
		<span className="rounded-full bg-foreground/8 px-2 py-1 font-sans text-[10px] font-normal whitespace-nowrap">
			{children}
		</span>
	);
}

function AreaChips({ status, names }: AreaChipsProps) {
	if (status === 'admin') {
		return (
			<div className="flex flex-wrap gap-1.5">
				<Chip>Todas</Chip>
			</div>
		);
	}

	if (status === 'pending') {
		return <span className="font-sans text-[12px] text-foreground/30">…</span>;
	}

	if (status === 'error') {
		return <span className="font-sans text-[12px] text-foreground/30">—</span>;
	}

	if (names.length === 0) {
		return <span className="font-sans text-[12px] text-foreground/30">Nenhuma</span>;
	}

	return (
		<div className="flex flex-wrap gap-1.5">
			{names.map((name) => (
				<Chip key={name}>{name}</Chip>
			))}
		</div>
	);
}

export { AreaChips };
