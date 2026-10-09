function formatAmountInCents(amountInCents: number, currency = 'brl'): string {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: currency.toUpperCase(),
	}).format(amountInCents / 100);
}

export { formatAmountInCents };
