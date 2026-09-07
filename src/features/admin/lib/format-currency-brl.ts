const formatter = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL',
	maximumFractionDigits: 0,
});

function formatCurrencyBrl(amount: number): string {
	return formatter.format(amount);
}

export { formatCurrencyBrl };
