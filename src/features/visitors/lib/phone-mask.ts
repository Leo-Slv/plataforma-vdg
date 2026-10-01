const PHONE_MAX_DIGITS = 11;

function phoneDigits(value: string): string {
	return value.replace(/\D/g, '').slice(0, PHONE_MAX_DIGITS);
}

// Brazilian landline (10 digits) or mobile (11 digits) mask, mirroring the
// "Primeira Vez" mockup. CourseCore normalizes back to digits on its side.
function maskPhone(value: string): string {
	const digits = phoneDigits(value);

	if (digits.length <= 2) {
		return digits.length ? `(${digits}` : '';
	}
	if (digits.length <= 6) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
	}
	if (digits.length <= 10) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
	}
	return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export { maskPhone, phoneDigits };
