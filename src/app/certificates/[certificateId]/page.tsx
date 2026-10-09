import { CertificatePage } from '@/features/certificates/components/certificate-page';

export default async function Certificate({
	params,
}: PageProps<'/certificates/[certificateId]'>) {
	const { certificateId } = await params;
	return <CertificatePage certificateId={certificateId} />;
}
