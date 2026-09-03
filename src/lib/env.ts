const env = {
	apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'https://localhost:7165',
	turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
};

export { env };
