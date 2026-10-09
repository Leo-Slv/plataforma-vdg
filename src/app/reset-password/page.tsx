import { Suspense } from 'react';

import { LoadingScreen } from '@/components/loading-screen';
import { AuthScreen } from '@/features/auth/components/auth-screen';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

export default function ResetPassword() {
	// The form reads ?token= with useSearchParams, which needs a Suspense
	// boundary to keep the route statically renderable.
	return (
		<AuthScreen
			title="Criar nova senha"
			subtitle="Use o link que enviamos por e-mail (ou o código dele) e escolha uma senha com pelo menos 12 caracteres."
		>
			<Suspense fallback={<LoadingScreen />}>
				<ResetPasswordForm />
			</Suspense>
		</AuthScreen>
	);
}
