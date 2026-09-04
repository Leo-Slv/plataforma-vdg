function getInitials(name: string | null): string {
	if (!name) {
		return '';
	}

	const [first, second] = name.trim().split(/\s+/);
	return `${first?.[0] ?? ''}${second?.[0] ?? ''}`.toUpperCase();
}

function getDisplayName(name: string | null): string {
	if (!name) {
		return '';
	}

	return name.trim().split(/\s+/).slice(0, 2).join(' ');
}

export { getInitials, getDisplayName };
