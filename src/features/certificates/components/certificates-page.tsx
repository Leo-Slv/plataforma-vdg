'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { appRoutes } from '@/lib/routes/app-routes';
import { getUserName } from '@/lib/auth/access-token';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { isApiError } from '@/lib/http/api-error';
import { AppNav } from '@/components/app-nav';
import { EmailVerificationBanner } from '@/components/email-verification-banner';
import { LoadingScreen } from '@/components/loading-screen';
import { useCurrentUserQuery } from '@/features/auth/hooks/auth.queries';
import {
	getDisplayName,
	getInitials,
} from '@/features/catalog/lib/user-display';
import { useMyCertificatesQuery } from '@/features/certificates/hooks/certificates.queries';
import { CertificatesList } from '@/features/certificates/components/certificates-list';

function CertificatesPage() {
	const router = useRouter();
	const ready = useRequireAuth();

	const currentUserQuery = useCurrentUserQuery({ enabled: ready });
	const certificatesQuery = useMyCertificatesQuery({ enabled: ready });

	useEffect(() => {
		if (
			certificatesQuery.isError &&
			isApiError(certificatesQuery.error) &&
			certificatesQuery.error.status === 401
		) {
			router.replace(appRoutes.auth.login);
		}
	}, [certificatesQuery.isError, certificatesQuery.error, router]);

	if (!ready) {
		return <LoadingScreen />;
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<AppNav
				displayName={getDisplayName(getUserName())}
				initials={getInitials(getUserName())}
				avatarUrl={currentUserQuery.data?.avatarUrl ?? null}
				active="certificates"
			/>
			<EmailVerificationBanner
				unverified={
					currentUserQuery.isSuccess && !currentUserQuery.data.emailVerifiedAt
				}
			/>

			<div className="mx-auto max-w-[860px] px-5 py-11 sm:px-10">
				<h1 className="font-heading text-[34px] font-extralight">
					Certificados
				</h1>

				{certificatesQuery.isPending ? (
					<p className="py-16 text-center font-sans text-sm font-light text-foreground/50">
						Carregando…
					</p>
				) : certificatesQuery.isError ? (
					<div className="flex flex-col items-center gap-4 py-16 text-center">
						<p className="font-sans text-sm font-light text-foreground/60">
							Não foi possível carregar seus certificados agora.
						</p>
						<button
							type="button"
							onClick={() => certificatesQuery.refetch()}
							className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
						>
							Tentar novamente
						</button>
					</div>
				) : (
					<div className="mt-6">
						<CertificatesList certificates={certificatesQuery.data} />
					</div>
				)}
			</div>
		</div>
	);
}

export { CertificatesPage };
