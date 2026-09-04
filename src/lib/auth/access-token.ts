const ACCESS_TOKEN_STORAGE_KEY = 'coursecore.auth.access-token';
const USER_EMAIL_STORAGE_KEY = 'coursecore.auth.user-email';
const USER_NAME_STORAGE_KEY = 'coursecore.auth.user-name';

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

function getUserEmail() {
	if (!canUseWebStorage()) {
		return null;
	}

	const value = window.localStorage.getItem(USER_EMAIL_STORAGE_KEY);
	return value && value.length > 0 ? value : null;
}

function setUserEmail(email: string) {
	if (!canUseWebStorage()) {
		return;
	}

	window.localStorage.setItem(USER_EMAIL_STORAGE_KEY, email);
}

function getUserName() {
	if (!canUseWebStorage()) {
		return null;
	}

	const value = window.localStorage.getItem(USER_NAME_STORAGE_KEY);
	return value && value.length > 0 ? value : null;
}

function setUserName(name: string) {
	if (!canUseWebStorage()) {
		return;
	}

	window.localStorage.setItem(USER_NAME_STORAGE_KEY, name);
}

function clearAccessToken() {
	if (!canUseWebStorage()) {
		return;
	}

	window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
	window.localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
	window.localStorage.removeItem(USER_NAME_STORAGE_KEY);
}

export {
	clearAccessToken,
	getAccessToken,
	setAccessToken,
	getUserEmail,
	setUserEmail,
	getUserName,
	setUserName,
};
