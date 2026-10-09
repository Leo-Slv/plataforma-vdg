import { AuthScreen } from '@/features/auth/components/auth-screen';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export default function ForgotPassword() {
	return (
		<AuthScreen
			title="Esqueceu a senha?"
			subtitle="Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha."
		>
			<ForgotPasswordForm />
		</AuthScreen>
	);
}
