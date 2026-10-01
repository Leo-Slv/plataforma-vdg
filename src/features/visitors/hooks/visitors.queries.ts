import { useMutation } from '@tanstack/react-query';

import { registerVisitor } from '@/features/visitors/api/register-visitor';

function useRegisterVisitorMutation() {
	return useMutation({
		mutationFn: registerVisitor,
	});
}

export { useRegisterVisitorMutation };
