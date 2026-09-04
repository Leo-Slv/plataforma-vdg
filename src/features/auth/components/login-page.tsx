import Image from 'next/image';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { LoginForm } from '@/features/auth/components/login-form';

function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-5 py-11 text-[#f2f2f0] sm:px-6">
			<div className="w-full max-w-[520px] px-6 pt-9 pb-8 sm:px-0">
				<Image
					src="/brand/viver-da-graca-mark.png"
					alt="Viver da Graça"
					width={52}
					height={52}
					className="size-13 rounded-full object-cover"
				/>

				<h1 className="mt-6.5 font-heading text-[34px] leading-[1.15] font-extralight">
					Bem-vindo de volta
				</h1>
				<p className="mt-2.5 text-[14px] font-light text-white/50">
					Não tem conta ainda?{' '}
					<Link
						href={appRoutes.auth.register}
						className="text-white/70 underline"
					>
						Criar conta
					</Link>
				</p>

				<LoginForm />
			</div>
		</div>
	);
}

export { LoginPage };
