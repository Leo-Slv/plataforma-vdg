function formatDateBr(iso: string): string {
	return new Date(iso).toLocaleDateString('pt-BR');
}

export { formatDateBr };
