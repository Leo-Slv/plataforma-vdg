import { useMutation } from '@tanstack/react-query';

import { registerUser } from '@/features/auth/api/register';
import { loginUser } from '@/features/auth/api/login';
import { confirmEmail } from '@/features/auth/api/confirm-email';
import { resendConfirmation } from '@/features/auth/api/resend-confirmation';

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

function useConfirmEmailMutation() {
	return useMutation({
		mutationFn: confirmEmail,
	});
}

function useResendConfirmationMutation() {
	return useMutation({
		mutationFn: resendConfirmation,
	});
}

export {
	useRegisterMutation,
	useLoginMutation,
	useConfirmEmailMutation,
	useResendConfirmationMutation,
};
