function formatDateTimeBr(iso: string): string {
	return new Date(iso).toLocaleString('pt-BR', {
		dateStyle: 'short',
		timeStyle: 'short',
	});
}

export { formatDateTimeBr };
