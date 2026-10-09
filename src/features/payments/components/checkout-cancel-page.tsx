'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { getUserName } from '@/lib/auth/access-token';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { AppNav } from '@/components/app-nav';
import { LoadingScreen } from '@/components/loading-screen';
import { useCurrentUserQuery } from '@/features/auth/hooks/auth.queries';
import { useCourseCatalogQuery } from '@/features/catalog/hooks/catalog.queries';
import {
	getDisplayName,
	getInitials,
} from '@/features/catalog/lib/user-display';
import { useMyOrdersQuery } from '@/features/payments/hooks/payments.queries';

function CheckoutCancelPage() {
	const orderId = useSearchParams().get('orderId') || null;
	const ready = useRequireAuth();
	const currentUserQuery = useCurrentUserQuery({ enabled: ready });
	const catalogQuery = useCourseCatalogQuery({ enabled: ready });
	const ordersQuery = useMyOrdersQuery({ enabled: ready && Boolean(orderId) });

	if (!ready) {
		return <LoadingScreen />;
	}

	const order = ordersQuery.data?.find((candidate) => candidate.id === orderId);
	const course = order
		? catalogQuery.data?.courses.find(
				(candidate) => candidate.id === order.courseId,
			)
		: undefined;

	return (
		<div className="min-h-screen bg-background text-foreground">
			<AppNav
				displayName={getDisplayName(getUserName())}
				initials={getInitials(getUserName())}
				avatarUrl={currentUserQuery.data?.avatarUrl ?? null}
				active="catalog"
			/>
			<div className="flex flex-col items-center gap-5 px-5 py-20 text-center sm:px-10">
				<h1 className="font-heading text-[30px] font-extralight sm:text-[38px]">
					Pagamento cancelado
				</h1>
				<p className="max-w-[460px] font-sans text-sm leading-relaxed font-light text-foreground/60">
					Você saiu do pagamento antes de concluir. Nenhuma cobrança foi feita e
					nenhum acesso foi liberado.
				</p>
				<div className="mt-2 flex flex-wrap justify-center gap-3">
					{course ? (
						<Link
							href={appRoutes.courses.detail(course.slug)}
							className="rounded-full bg-foreground px-6 py-3 font-sans text-[13px] text-background"
						>
							Voltar ao curso
						</Link>
					) : null}
					<Link
						href={appRoutes.catalog.index}
						className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
					>
						Catálogo
					</Link>
				</div>
			</div>
		</div>
	);
}

export { CheckoutCancelPage };
