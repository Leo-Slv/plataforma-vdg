import Image from 'next/image';

import { footerContent } from '@/features/landing/lib/landing-content';
import { formatIssueDate } from '@/features/certificates/lib/format-issue-date';
import type { Certificate } from '@/features/certificates/model/certificate';

type CertificateDocumentProps = {
	certificate: Certificate;
	studentName: string;
};

/**
 * The printable certificate. It keeps its own light, high-contrast look so
 * it prints (or saves as PDF) the same regardless of the app's dark theme.
 */
function CertificateDocument({
	certificate,
	studentName,
}: CertificateDocumentProps) {
	return (
		<article
			aria-label={`Certificado de ${certificate.courseTitle}`}
			className="mx-auto flex w-full max-w-[900px] flex-col items-center rounded-[6px] border-[6px] border-double border-[#1c2a4a] bg-white px-8 py-12 text-center text-[#1c2a4a] sm:px-16 sm:py-16 print:max-w-none print:rounded-none"
		>
			<Image
				src="/brand/viver-da-graca-mark.png"
				alt=""
				aria-hidden
				width={72}
				height={72}
				className="size-18 rounded-full object-cover"
			/>
			<div className="mt-4 font-heading text-[12px] tracking-[0.24em] uppercase">
				{footerContent.orgName}
			</div>
			<div className="font-heading text-[11px] tracking-[0.2em] text-[#1c2a4a]/60 uppercase">
				{footerContent.schoolName}
			</div>

			<h1 className="mt-10 font-heading text-[40px] leading-[1.1] font-extralight sm:text-[52px]">
				Certificado de conclusão
			</h1>

			<p className="mt-9 text-[15px] font-light text-[#1c2a4a]/70">
				Certificamos que
			</p>
			<p className="mt-3 font-heading text-[32px] leading-[1.2] font-light sm:text-[40px]">
				{studentName}
			</p>
			<p className="mt-6 max-w-[620px] text-[15px] leading-[1.8] font-light text-[#1c2a4a]/70">
				concluiu com êxito o curso
			</p>
			<p className="mt-2 font-heading text-[26px] leading-[1.25] font-light sm:text-[32px]">
				{certificate.courseTitle}
			</p>

			<p className="mt-10 text-[14px] font-light text-[#1c2a4a]/70">
				Emitido em {formatIssueDate(certificate.issuedAt)}
			</p>
			<p className="mt-8 font-mono text-[10px] tracking-wider text-[#1c2a4a]/40">
				Código do certificado: {certificate.id}
			</p>
		</article>
	);
}

export { CertificateDocument };
