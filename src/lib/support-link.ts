type SupportChannels = {
	email: string;
	whatsapp: string;
};

/**
 * Link to the church's support channel, from the optional
 * NEXT_PUBLIC_SUPPORT_* settings. WhatsApp wins when both are set; with
 * neither, there is no link (the footer simply omits "Suporte" instead of
 * showing a dead label).
 */
function getSupportHref({ email, whatsapp }: SupportChannels): string | null {
	const digits = whatsapp.replace(/\D/g, '');

	if (digits.length >= 10) {
		return `https://wa.me/${digits}`;
	}

	const trimmedEmail = email.trim();

	return trimmedEmail.includes('@') ? `mailto:${trimmedEmail}` : null;
}

export { getSupportHref };
export type { SupportChannels };
