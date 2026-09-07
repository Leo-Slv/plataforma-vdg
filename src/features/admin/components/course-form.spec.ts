import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { CourseForm } from '@/features/admin/components/course-form';
import type { CourseFormValues } from '@/features/admin/schemas/course-form.schema';

const baseValues: CourseFormValues = {
	title: 'Escola de Líderes',
	description: '8 módulos, mentoria em grupo.',
	thumbnailUrl: '',
	pricingModel: 'Free',
	priceAmount: '',
	areaId: '',
	displayOrder: 2,
	issuesCertificate: true,
	isFeatured: false,
	published: true,
};

const noop = () => {};

test('create mode renders "Criar curso" and hides edit-only affordances', () => {
	const html = renderToStaticMarkup(
		createElement(CourseForm, {
			mode: 'create',
			defaultValues: { ...baseValues, title: '' },
			areas: [],
			onCancel: noop,
			onSubmit: noop,
			isSubmitting: false,
		}),
	);

	assert.match(html, /Criar curso/);
	assert.doesNotMatch(html, /Excluir curso/);
	assert.doesNotMatch(html, /Pré-visualizar/);
});

test('edit mode renders "Salvar curso", the delete action, and content panel', () => {
	const html = renderToStaticMarkup(
		createElement(CourseForm, {
			mode: 'edit',
			defaultValues: baseValues,
			areas: [],
			onCancel: noop,
			onSubmit: noop,
			isSubmitting: false,
			onDelete: noop,
		}),
	);

	assert.match(html, /Salvar curso/);
	assert.match(html, /Excluir curso/);
	assert.match(html, /Conteúdo/);
});

test('renders "Pré-visualizar" as a link when previewHref is given', () => {
	const html = renderToStaticMarkup(
		createElement(CourseForm, {
			mode: 'edit',
			defaultValues: baseValues,
			areas: [],
			previewHref: '/courses/escola-de-lideres',
			onCancel: noop,
			onSubmit: noop,
			isSubmitting: false,
		}),
	);

	assert.match(html, /href="\/courses\/escola-de-lideres"/);
});

test('renders the slug computed from the title', () => {
	const html = renderToStaticMarkup(
		createElement(CourseForm, {
			mode: 'create',
			defaultValues: { ...baseValues, title: 'Escola de Líderes' },
			areas: [],
			onCancel: noop,
			onSubmit: noop,
			isSubmitting: false,
		}),
	);

	assert.match(html, /\/escola-de-lideres/);
});

test('renders a price input only when pricingModel is Paid', () => {
	const freeHtml = renderToStaticMarkup(
		createElement(CourseForm, {
			mode: 'create',
			defaultValues: { ...baseValues, pricingModel: 'Free' },
			areas: [],
			onCancel: noop,
			onSubmit: noop,
			isSubmitting: false,
		}),
	);
	assert.doesNotMatch(freeHtml, /placeholder="R\$ 0,00"/);

	const paidHtml = renderToStaticMarkup(
		createElement(CourseForm, {
			mode: 'create',
			defaultValues: {
				...baseValues,
				pricingModel: 'Paid',
				priceAmount: '149',
			},
			areas: [],
			onCancel: noop,
			onSubmit: noop,
			isSubmitting: false,
		}),
	);
	assert.match(paidHtml, /placeholder="R\$ 0,00"/);
});

test('renders one option per area in the Área select', () => {
	const html = renderToStaticMarkup(
		createElement(CourseForm, {
			mode: 'create',
			defaultValues: baseValues,
			areas: [
				{
					id: 'area-1',
					name: 'Liderança',
					slug: 'lideranca',
					description: '',
					active: true,
					displayOrder: 0,
					accentColor: 'Blue',
					courseCount: 0,
					courses: [],
					createdAt: '2026-01-01T00:00:00Z',
					updatedAt: '2026-01-01T00:00:00Z',
				},
			],
			onCancel: noop,
			onSubmit: noop,
			isSubmitting: false,
		}),
	);

	assert.match(html, /Liderança/);
});

test('renders the submit error banner when present', () => {
	const html = renderToStaticMarkup(
		createElement(CourseForm, {
			mode: 'edit',
			defaultValues: baseValues,
			areas: [],
			onCancel: noop,
			onSubmit: noop,
			isSubmitting: false,
			submitError: 'Já existe um curso com um título parecido.',
		}),
	);

	assert.match(html, /Já existe um curso com um título parecido\./);
});
