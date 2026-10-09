import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { certificateSchema } from '@/features/certificates/schemas/certificate.schema';
import type { Certificate } from '@/features/certificates/model/certificate';

async function getMyCertificates(): Promise<Certificate[]> {
	const data = await apiFetch('/api/certificates/mine');
	return z.array(certificateSchema).parse(data);
}

export { getMyCertificates };
