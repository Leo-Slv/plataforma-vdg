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

// Whole amounts stay compact (R$ 149); anything with cents keeps them (R$ 49,90)
// so the price shown is always the price Stripe will charge.
function formatCurrencyBrl(amount: number): string {
	return Number.isInteger(amount)
		? wholeFormatter.format(amount)
		: centsFormatter.format(amount);
}

export { formatCurrencyBrl };
