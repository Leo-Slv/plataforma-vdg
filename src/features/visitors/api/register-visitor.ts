import { apiFetch } from '@/lib/http/api-client';
import { visitorRegistrationSchema } from '@/features/visitors/schemas/visitor-registration.schema';
import type { VisitorRegistration } from '@/features/visitors/model/visitor-registration';

type RegisterVisitorPayload = {
	name: string;
	phone: string;
	email: string;
	address: string | null;
	captchaToken: string;
};

async function registerVisitor(
	payload: RegisterVisitorPayload,
): Promise<VisitorRegistration> {
	const data = await apiFetch('/api/visitors', {
		method: 'POST',
		body: payload,
	});
	return visitorRegistrationSchema.parse(data);
}

export { registerVisitor };
export type { RegisterVisitorPayload };
