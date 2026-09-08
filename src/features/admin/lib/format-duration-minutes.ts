function formatDurationMinutes(seconds: number | null): string {
	if (seconds === null) {
		return 'sem vídeo';
	}

	return `${Math.floor(seconds / 60)}min · vídeo pronto`;
}

export { formatDurationMinutes };
