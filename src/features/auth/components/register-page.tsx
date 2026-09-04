import Image from 'next/image';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { RegisterForm } from '@/features/auth/components/register-form';

function RegisterPage() {
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
					Criar sua conta
				</h1>
				<p className="mt-2.5 text-[14px] font-light text-white/50">
					Já tem conta?{' '}
					<Link href={appRoutes.auth.login} className="text-white/70 underline">
						Entrar
					</Link>
				</p>

				<RegisterForm />
			</div>
		</div>
	);
}

export { RegisterPage };
