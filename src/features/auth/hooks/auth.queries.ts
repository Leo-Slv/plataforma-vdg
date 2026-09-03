import { useMutation } from '@tanstack/react-query';

import { registerUser } from '@/features/auth/api/register';
import { loginUser } from '@/features/auth/api/login';

function useRegisterMutation() {
	return useMutation({
		mutationFn: registerUser,
	});
}

function useLoginMutation() {
	return useMutation({
		mutationFn: loginUser,
	});
}

export { useRegisterMutation, useLoginMutation };
