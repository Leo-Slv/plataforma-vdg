import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { formatShortIssueDate } from '@/features/certificates/lib/format-issue-date';
import type { Certificate } from '@/features/certificates/model/certificate';

type CertificatesListProps = {
	certificates: Certificate[];
};

function CertificatesList({ certificates }: CertificatesListProps) {
	if (certificates.length === 0) {
		return (
			<div className="flex flex-col items-center gap-4 py-16 text-center">
				<p className="max-w-[420px] font-sans text-sm font-light text-foreground/50">
					Você ainda não tem certificados. Ao concluir 100% de um curso que
					emite certificado, ele aparece aqui.
				</p>
				<Link
					href={appRoutes.myCourses.index}
					className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
				>
					Ver meus cursos
				</Link>
			</div>
		);
	}

	return (
		<ul className="flex flex-col">
			{certificates.map((certificate) => (
				<li
					key={certificate.id}
					className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/8 py-4.5"
				>
					<div className="min-w-0">
						<div className="font-heading text-[16px] text-foreground">
							{certificate.courseTitle}
						</div>
						<div className="mt-1 font-sans text-[12px] font-light text-foreground/40">
							Emitido em {formatShortIssueDate(certificate.issuedAt)}
						</div>
					</div>
					<Link
						href={appRoutes.certificates.detail(certificate.id)}
						className="rounded-full border border-foreground/20 px-5 py-2.5 font-sans text-[12.5px] text-foreground"
					>
						Ver e imprimir
					</Link>
				</li>
			))}
		</ul>
	);
}

export { CertificatesList };
