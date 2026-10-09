import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { CertificatesList } from '@/features/certificates/components/certificates-list';
import type { Certificate } from '@/features/certificates/model/certificate';

const certificate: Certificate = {
	id: 'cert-1',
	courseId: 'course-1',
	courseTitle: 'Escola de Líderes',
	courseSlug: 'escola-de-lideres',
	issuedAt: '2026-10-05T15:00:00.000Z',
};

test('explains how to get a certificate when there is none', () => {
	const html = renderToStaticMarkup(
		createElement(CertificatesList, { certificates: [] }),
	);

	assert.match(html, /Você ainda não tem certificados/);
	assert.match(html, /href="\/my-courses"/);
});

test('lists each certificate with its date and a link to the printable page', () => {
	const html = renderToStaticMarkup(
		createElement(CertificatesList, { certificates: [certificate] }),
	);

	assert.match(html, /Escola de Líderes/);
	assert.match(html, /05\/10\/2026/);
	assert.match(html, /href="\/certificates\/cert-1"/);
});
