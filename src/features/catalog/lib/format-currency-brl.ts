const wholeFormatter = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL',
	maximumFractionDigits: 0,
});

const centsFormatter = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

function formatCurrencyBrl(amount: number): string {
	return wholeFormatter.format(amount);
}

function formatCurrencyBrlWithCents(amount: number): string {
	return centsFormatter.format(amount);
}

export { formatCurrencyBrl, formatCurrencyBrlWithCents };
