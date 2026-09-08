import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';
import { registerUser } from '@/features/auth/api/register';
import { loginUser } from '@/features/auth/api/login';
import { confirmEmail } from '@/features/auth/api/confirm-email';
import { resendConfirmation } from '@/features/auth/api/resend-confirmation';
import { getCurrentUser } from '@/features/auth/api/get-current-user';
import { logoutUser } from '@/features/auth/api/logout';

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

function useCurrentUserQuery(options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.auth.currentUser,
		queryFn: getCurrentUser,
		enabled: options.enabled,
	});
}

function useLogoutMutation() {
	return useMutation({
		mutationFn: logoutUser,
	});
}

export {
	useRegisterMutation,
	useLoginMutation,
	useConfirmEmailMutation,
	useResendConfirmationMutation,
	useCurrentUserQuery,
	useLogoutMutation,
};
