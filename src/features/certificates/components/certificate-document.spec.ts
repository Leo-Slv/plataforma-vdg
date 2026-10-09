import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { CertificateDocument } from '@/features/certificates/components/certificate-document';
import type { Certificate } from '@/features/certificates/model/certificate';

const certificate: Certificate = {
	id: 'cert-123',
	courseId: 'course-1',
	courseTitle: 'Escola de Líderes',
	courseSlug: 'escola-de-lideres',
	issuedAt: '2026-10-05T15:00:00.000Z',
};

test('prints the student, the course, the issue date and the certificate code', () => {
	const html = renderToStaticMarkup(
		createElement(CertificateDocument, {
			certificate,
			studentName: 'Ana Lima',
		}),
	);

	assert.match(html, /Certificado de conclusão/);
	assert.match(html, /Ana Lima/);
	assert.match(html, /Escola de Líderes/);
	assert.match(html, /5 de outubro de 2026/);
	assert.match(html, /cert-123/);
	assert.match(html, /Igreja Viver da Graça/);
});
