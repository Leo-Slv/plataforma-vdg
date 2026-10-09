const longDateFormatter = new Intl.DateTimeFormat('pt-BR', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
	timeZone: 'America/Sao_Paulo',
});

function formatIssueDate(iso: string): string {
	return longDateFormatter.format(new Date(iso));
}

function formatShortIssueDate(iso: string): string {
	return new Date(iso).toLocaleDateString('pt-BR', {
		timeZone: 'America/Sao_Paulo',
	});
}

export { formatIssueDate, formatShortIssueDate };
