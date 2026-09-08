import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { appRoutes } from '@/lib/routes/app-routes';
import { PreviewModuleCard } from '@/features/catalog/components/preview-module-card';
import type {
	CourseModule,
	Lesson,
} from '@/features/catalog/model/course-details';

function lesson(overrides: Partial<Lesson>): Lesson {
	return {
		id: 'lesson-1',
		title: 'Aula',
		description: '',
		displayOrder: 1,
		freePreview: false,
		published: true,
		videoId: null,
		durationSeconds: null,
		...overrides,
	};
}

function courseModule(overrides: Partial<CourseModule>): CourseModule {
	return {
		id: 'module-1',
		title: 'Chamado e caráter',
		description: '',
		displayOrder: 1,
		published: true,
		lessons: [],
		...overrides,
	};
}

test('links to the first free lesson and shows its known duration when the module has one', () => {
	const html = renderToStaticMarkup(
		createElement(PreviewModuleCard, {
			module: courseModule({
				lessons: [
					lesson({
						id: 'l1',
						freePreview: true,
						durationSeconds: 1200,
					}),
					lesson({ id: 'l2', freePreview: false, durationSeconds: null }),
				],
			}),
			position: 1,
			slug: 'escola-de-lideres',
		}),
	);

	assert.match(
		html,
		new RegExp(`href="${appRoutes.courses.lesson('escola-de-lideres', 'l1')}"`),
	);
	assert.match(html, /Assistir aula grátis/);
	assert.match(html, /20min/);
	assert.match(html, /1 aula grátis/);
});

test('renders "Bloqueado" with no link when the module has no free lesson', () => {
	const html = renderToStaticMarkup(
		createElement(PreviewModuleCard, {
			module: courseModule({
				lessons: [lesson({ id: 'l1', freePreview: false })],
			}),
			position: 3,
			slug: 'escola-de-lideres',
		}),
	);

	assert.match(html, /Bloqueado/);
	assert.match(html, /Requer inscrição/);
	assert.doesNotMatch(html, /<a /);
});
