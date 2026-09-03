import { useMutation } from '@tanstack/react-query';

import { registerUser } from '@/features/auth/api/register';

function useRegisterMutation() {
	return useMutation({
		mutationFn: registerUser,
	});
}

export { useRegisterMutation };
