import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AreaForm } from '@/features/admin/components/area-form';
import type { AreaFormValues } from '@/features/admin/schemas/area-form.schema';
import type { Area } from '@/features/admin/model/area';

const baseValues: AreaFormValues = {
	name: 'Liderança',
	description: 'Formação de líderes.',
	displayOrder: 2,
	accentColor: 'Blue',
	active: true,
};

const noop = () => {};

test('create mode renders "Criar área" and hides edit-only affordances', () => {
	const html = renderToStaticMarkup(
		createElement(AreaForm, {
			mode: 'create',
			defaultValues: { ...baseValues, name: '' },
			onCancel: noop,
			onSubmit: noop,
			isSubmitting: false,
		}),
	);

	assert.match(html, /Criar área/);
	assert.doesNotMatch(html, /Excluir área/);
	assert.doesNotMatch(html, /Área ativa/);
});

test('edit mode renders "Salvar área", the status toggle, and the delete action', () => {
	const html = renderToStaticMarkup(
		createElement(AreaForm, {
			mode: 'edit',
			defaultValues: baseValues,
			onCancel: noop,
			onSubmit: noop,
			isSubmitting: false,
			onDelete: noop,
		}),
	);

	assert.match(html, /Salvar área/);
	assert.match(html, /Área ativa/);
	assert.match(html, /Excluir área/);
});

test('renders the slug computed from the name', () => {
	const html = renderToStaticMarkup(
		createElement(AreaForm, {
			mode: 'create',
			defaultValues: { ...baseValues, name: 'Escola de Líderes' },
			onCancel: noop,
			onSubmit: noop,
			isSubmitting: false,
		}),
	);

	assert.match(html, /\/escola-de-lideres/);
});

test('renders the courses panel when courses are given', () => {
	const courses: Area['courses'] = [
		{ id: 'c1', title: 'Escola de Líderes', slug: 'escola', published: true },
		{ id: 'c2', title: 'Rascunho X', slug: 'rascunho-x', published: false },
	];

	const html = renderToStaticMarkup(
		createElement(AreaForm, {
			mode: 'edit',
			defaultValues: baseValues,
			courses,
			onCancel: noop,
			onSubmit: noop,
			isSubmitting: false,
			onDelete: noop,
		}),
	);

	assert.match(html, /Cursos nesta área/);
	assert.match(html, /Publicado/);
	assert.match(html, /Rascunho/);
});

test('renders the submit error banner when present', () => {
	const html = renderToStaticMarkup(
		createElement(AreaForm, {
			mode: 'edit',
			defaultValues: baseValues,
			onCancel: noop,
			onSubmit: noop,
			isSubmitting: false,
			submitError: 'Já existe uma área com um nome parecido.',
		}),
	);

	assert.match(html, /Já existe uma área com um nome parecido\./);
});
