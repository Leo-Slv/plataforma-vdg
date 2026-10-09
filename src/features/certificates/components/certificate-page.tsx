'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { appRoutes } from '@/lib/routes/app-routes';
import { getUserName } from '@/lib/auth/access-token';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { isApiError } from '@/lib/http/api-error';
import { AppNav } from '@/components/app-nav';
import { LoadingScreen } from '@/components/loading-screen';
import { useCurrentUserQuery } from '@/features/auth/hooks/auth.queries';
import {
	getDisplayName,
	getInitials,
} from '@/features/catalog/lib/user-display';
import { useMyCertificatesQuery } from '@/features/certificates/hooks/certificates.queries';
import { CertificateDocument } from '@/features/certificates/components/certificate-document';

type CertificatePageProps = {
	certificateId: string;
};

function CertificatePage({ certificateId }: CertificatePageProps) {
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

	const certificate = certificatesQuery.data?.find(
		(candidate) => candidate.id === certificateId,
	);
	const studentName =
		currentUserQuery.data?.name ?? getUserName() ?? 'Aluno(a)';

	return (
		<div className="min-h-screen bg-background text-foreground print:bg-white">
			{/* A4 landscape, tight margins: the certificate is the whole page. */}
			<style>{'@page { size: A4 landscape; margin: 10mm; }'}</style>

			<div className="print:hidden">
				<AppNav
					displayName={getDisplayName(getUserName())}
					initials={getInitials(getUserName())}
					avatarUrl={currentUserQuery.data?.avatarUrl ?? null}
					active="certificates"
				/>
			</div>

			<div className="px-5 py-9 sm:px-10 print:p-0">
				{certificatesQuery.isPending ? (
					<p className="py-16 text-center font-sans text-sm font-light text-foreground/50">
						Carregando…
					</p>
				) : certificatesQuery.isError ? (
					<div className="flex flex-col items-center gap-4 py-16 text-center">
						<p className="font-sans text-sm font-light text-foreground/60">
							Não foi possível carregar este certificado agora.
						</p>
						<button
							type="button"
							onClick={() => certificatesQuery.refetch()}
							className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
						>
							Tentar novamente
						</button>
					</div>
				) : !certificate ? (
					<div className="flex flex-col items-center gap-4 py-16 text-center">
						<p className="font-sans text-sm font-light text-foreground/60">
							Certificado não encontrado.
						</p>
						<Link
							href={appRoutes.certificates.index}
							className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
						>
							Ver meus certificados
						</Link>
					</div>
				) : (
					<>
						<div className="mx-auto mb-6 flex max-w-[900px] flex-wrap items-center justify-between gap-3 print:hidden">
							<Link
								href={appRoutes.certificates.index}
								className="font-sans text-[13px] font-light text-foreground/50"
							>
								← Meus certificados
							</Link>
							<button
								type="button"
								onClick={() => window.print()}
								className="rounded-full bg-foreground px-5.5 py-3 font-sans text-[13px] text-background"
							>
								Imprimir / salvar PDF
							</button>
						</div>
						<CertificateDocument
							certificate={certificate}
							studentName={studentName}
						/>
					</>
				)}
			</div>
		</div>
	);
}

export { CertificatePage };
