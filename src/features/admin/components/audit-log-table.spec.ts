import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AuditLogTable } from '@/features/admin/components/audit-log-table';
import type { AuditLog } from '@/features/admin/model/audit-log';

function buildEntry(overrides: Partial<AuditLog>): AuditLog {
	return {
		id: 'log-1',
		userId: 'user-1',
		action: 'CoursePublished',
		entityName: 'Course',
		entityId: 'course-1',
		metadata: { displayName: 'Curso de Batismo' },
		createdAt: new Date().toISOString(),
		...overrides,
	};
}

test('renders "Nenhuma ação registrada ainda." when there are no entries', () => {
	const html = renderToStaticMarkup(
		createElement(AuditLogTable, {
			entries: [],
			courses: [],
			areas: [],
			userEmailById: new Map(),
			userLookupReady: true,
		}),
	);
	assert.match(html, /Nenhuma ação registrada ainda\./);
});

test('renders the action, resolved detail, and a resolved user email', () => {
	const html = renderToStaticMarkup(
		createElement(AuditLogTable, {
			entries: [buildEntry({ userId: 'user-1' })],
			courses: [],
			areas: [],
			userEmailById: new Map([['user-1', 'pastor.joao@vdg.org']]),
			userLookupReady: true,
		}),
	);
	assert.match(html, /CoursePublished/);
	assert.match(html, /Curso de Batismo/);
	assert.match(html, /pastor\.joao@vdg\.org/);
});

test('renders a shortened id when the user lookup finished without resolving', () => {
	const html = renderToStaticMarkup(
		createElement(AuditLogTable, {
			entries: [buildEntry({ userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })],
			courses: [],
			areas: [],
			userEmailById: new Map(),
			userLookupReady: true,
		}),
	);
	assert.match(html, /#a1b2c3d4/);
});

test('renders a placeholder while the user lookup is still loading', () => {
	const html = renderToStaticMarkup(
		createElement(AuditLogTable, {
			entries: [buildEntry({ userId: 'user-1' })],
			courses: [],
			areas: [],
			userEmailById: new Map(),
			userLookupReady: false,
		}),
	);
	assert.match(html, /…/);
});

test('renders an em dash when the entry has no userId', () => {
	const html = renderToStaticMarkup(
		createElement(AuditLogTable, {
			entries: [buildEntry({ userId: null })],
			courses: [],
			areas: [],
			userEmailById: new Map(),
			userLookupReady: true,
		}),
	);
	assert.match(html, /—/);
});
