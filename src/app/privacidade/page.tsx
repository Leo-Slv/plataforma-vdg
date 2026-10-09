import { LegalPage } from '@/features/legal/components/legal-page';
import { privacyDocument } from '@/features/legal/lib/legal-content';

export default function Privacy() {
	return <LegalPage document={privacyDocument} />;
}
