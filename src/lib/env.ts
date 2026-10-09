const env = {
	apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'https://localhost:7165',
	turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
	// Optional support channels shown in the footer; leave empty to hide the link.
	supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? '',
	supportWhatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? '',
};

export { env };
