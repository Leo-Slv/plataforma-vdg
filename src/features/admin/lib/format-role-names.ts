function formatRoleNames(roleNames: string[]): string {
	return roleNames.length > 0 ? roleNames.join(', ') : 'Sem papel';
}

export { formatRoleNames };
