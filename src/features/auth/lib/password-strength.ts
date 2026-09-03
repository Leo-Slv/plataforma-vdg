function passwordStrengthSegments(password: string): 0 | 1 | 2 | 3 | 4 {
	if (password.length < 12) return 0;
	if (password.length < 16) return 1;
	if (password.length < 20) return 2;
	if (password.length < 24) return 3;
	return 4;
}

export { passwordStrengthSegments };
