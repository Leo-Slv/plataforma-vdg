function formatVideoStatus(status: string): string {
	switch (status) {
		case 'Ready':
			return 'Pronto';
		case 'Processing':
			return 'Processando';
		case 'Failed':
			return 'Falhou';
		default:
			return status;
	}
}

export { formatVideoStatus };
