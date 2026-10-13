function isSamePermissionSet(
	draft: ReadonlySet<string>,
	saved: readonly string[],
) {
	return draft.size === saved.length && saved.every((key) => draft.has(key));
}

export { isSamePermissionSet };
