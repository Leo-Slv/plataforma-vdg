import { LegalPage } from '@/features/legal/components/legal-page';
import { termsDocument } from '@/features/legal/lib/legal-content';

export default function Terms() {
	return <LegalPage document={termsDocument} />;
}
