import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import type { CheckoutView } from '@/features/payments/lib/checkout-view';

type CheckoutResultProps = {
	view: CheckoutView;
	courseTitle?: string | null;
	courseHref?: string | null;
	onRetry?: () => void;
};

const linkClass =
	'rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground';
const primaryLinkClass =
	'rounded-full bg-foreground px-6 py-3 font-sans text-[13px] text-background';

function Heading({ children }: { children: string }) {
	return (
		<h1 className="font-heading text-[30px] font-extralight sm:text-[38px]">
			{children}
		</h1>
	);
}

function Body({ children }: { children: string }) {
	return (
		<p className="max-w-[460px] font-sans text-sm leading-relaxed font-light text-foreground/60">
			{children}
		</p>
	);
}

function CheckoutResult({
	view,
	courseTitle = null,
	courseHref = null,
	onRetry,
}: CheckoutResultProps) {
	return (
		<div
			role="status"
			aria-live="polite"
			className="flex flex-col items-center gap-5 px-5 py-20 text-center sm:px-10"
		>
			{view === 'loading' || view === 'confirming' ? (
				<>
					<Heading>Confirmando seu pagamento…</Heading>
					<Body>
						Estamos aguardando a confirmação do Stripe. Isso costuma levar
						alguns segundos — não feche esta página.
					</Body>
				</>
			) : null}

			{view === 'paid' ? (
				<>
					<Heading>Pagamento confirmado</Heading>
					<Body>
						{courseTitle
							? `Seu acesso a "${courseTitle}" já está liberado.`
							: 'Seu acesso ao curso já está liberado.'}
					</Body>
					<div className="mt-2 flex flex-wrap justify-center gap-3">
						{courseHref ? (
							<Link href={courseHref} className={primaryLinkClass}>
								Ir para o curso
							</Link>
						) : null}
						<Link href={appRoutes.myCourses.index} className={linkClass}>
							Meus cursos
						</Link>
					</div>
				</>
			) : null}

			{view === 'delayed' ? (
				<>
					<Heading>Ainda estamos confirmando</Heading>
					<Body>
						A confirmação do pagamento está demorando mais que o normal. Se o
						valor foi cobrado, o acesso será liberado assim que o Stripe nos
						avisar — você pode acompanhar em &quot;Minhas compras&quot;.
					</Body>
					<div className="mt-2 flex flex-wrap justify-center gap-3">
						{onRetry ? (
							<button
								type="button"
								onClick={onRetry}
								className={primaryLinkClass}
							>
								Verificar novamente
							</button>
						) : null}
						<Link href={appRoutes.orders.index} className={linkClass}>
							Minhas compras
						</Link>
					</div>
				</>
			) : null}

			{view === 'not-paid' ? (
				<>
					<Heading>Pagamento não concluído</Heading>
					<Body>
						Este pedido expirou ou não foi concluído. Nenhum acesso foi liberado
						— você pode tentar a compra novamente.
					</Body>
					<div className="mt-2 flex flex-wrap justify-center gap-3">
						{courseHref ? (
							<Link href={courseHref} className={primaryLinkClass}>
								Voltar ao curso
							</Link>
						) : null}
						<Link href={appRoutes.catalog.index} className={linkClass}>
							Catálogo
						</Link>
					</div>
				</>
			) : null}

			{view === 'not-found' ? (
				<>
					<Heading>Pedido não encontrado</Heading>
					<Body>Não encontramos este pedido na sua conta.</Body>
					<div className="mt-2 flex flex-wrap justify-center gap-3">
						<Link href={appRoutes.orders.index} className={primaryLinkClass}>
							Minhas compras
						</Link>
						<Link href={appRoutes.catalog.index} className={linkClass}>
							Catálogo
						</Link>
					</div>
				</>
			) : null}
		</div>
	);
}

export { CheckoutResult };
