const ACCESS_TOKEN_STORAGE_KEY = 'coursecore.auth.access-token';

function canUseWebStorage() {
	return (
		typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
	);
}

function getAccessToken() {
	if (!canUseWebStorage()) {
		return null;
	}

	const value = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
	return value && value.length > 0 ? value : null;
}

function setAccessToken(token: string) {
	if (!canUseWebStorage()) {
		return;
	}

	window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

function clearAccessToken() {
	if (!canUseWebStorage()) {
		return;
	}

	window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export { clearAccessToken, getAccessToken, setAccessToken };
