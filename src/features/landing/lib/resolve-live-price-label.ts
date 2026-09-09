const currencyFormatter = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL',
	maximumFractionDigits: 0,
});

type LivePricing = {
	pricingModel: 'Free' | 'Paid' | 'EnrollmentControlled';
	priceAmount: number | null;
};

function resolveLivePriceLabel(course: LivePricing): string {
	if (course.pricingModel === 'Free') {
		return 'Gratuito';
	}

	if (course.pricingModel === 'EnrollmentControlled') {
		return 'Por inscrição';
	}

	return course.priceAmount === null
		? 'Pago'
		: currencyFormatter.format(course.priceAmount);
}

export { resolveLivePriceLabel };
