import { isApiError } from '@/lib/http/api-error';

const GENERIC_CHECKOUT_ERROR =
	'Não foi possível iniciar o pagamento. Tente novamente.';

function checkoutErrorMessage(error: unknown): string {
	if (!isApiError(error)) {
		return GENERIC_CHECKOUT_ERROR;
	}

	switch (error.status) {
		case 403:
			return 'Confirme seu e-mail para poder comprar este curso.';
		case 404:
			return 'Este curso não está disponível para compra.';
		case 409:
			return 'Você já tem acesso a este curso ou ele não está disponível para compra.';
		case 502:
			return 'O serviço de pagamento está indisponível no momento. Tente novamente em instantes.';
		default:
			return GENERIC_CHECKOUT_ERROR;
	}
}

export { checkoutErrorMessage, GENERIC_CHECKOUT_ERROR };
