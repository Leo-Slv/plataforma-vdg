import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { appRoutes } from '@/lib/routes/app-routes';
import { AuditLogPanel } from '@/features/admin/components/audit-log-panel';

const noop = () => {};

test('renders the given entries with their labels and relative times', () => {
	const html = renderToStaticMarkup(
		createElement(AuditLogPanel, {
			status: 'ready',
			entries: [
				{
					id: '1',
					label: 'CoursePublished · Curso de Batismo',
					relativeTime: 'há 2h',
				},
				{ id: '2', label: 'AreaUpdated · Liderança', relativeTime: 'ontem' },
			],
		}),
	);
	assert.match(html, /CoursePublished · Curso de Batismo/);
	assert.match(html, /há 2h/);
	assert.match(html, /AreaUpdated · Liderança/);
	assert.match(html, /ontem/);
});

test('links to the full audit screen when there are entries', () => {
	const html = renderToStaticMarkup(
		createElement(AuditLogPanel, {
			status: 'ready',
			entries: [{ id: '1', label: 'CoursePublished', relativeTime: 'há 2h' }],
		}),
	);
	assert.match(html, new RegExp(`href="${appRoutes.admin.audit}"`));
});

test('renders an empty-state message when there are no entries, with no link', () => {
	const html = renderToStaticMarkup(
		createElement(AuditLogPanel, { status: 'ready', entries: [] }),
	);
	assert.match(html, /Nenhuma ação registrada ainda\./);
	assert.doesNotMatch(html, /<a /);
});

test('renders the permission-denied message', () => {
	const html = renderToStaticMarkup(
		createElement(AuditLogPanel, { status: 'forbidden' }),
	);
	assert.match(html, /Sem permissão para ver auditoria\./);
});

test('renders the error state with a retry action', () => {
	const html = renderToStaticMarkup(
		createElement(AuditLogPanel, { status: 'error', onRetry: noop }),
	);
	assert.match(html, /Não foi possível carregar as ações auditadas\./);
	assert.match(html, /Tentar novamente/);
});
