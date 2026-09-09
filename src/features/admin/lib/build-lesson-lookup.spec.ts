import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildLessonLookup } from '@/features/admin/lib/build-lesson-lookup';
import type { Course } from '@/features/admin/model/course';
import type { CourseModule } from '@/features/admin/model/course-module';

function buildCourse(overrides: Partial<Course>): Course {
	return {
		id: 'course-1',
		title: 'Curso de Batismo',
		slug: 'curso-de-batismo',
		description: '',
		thumbnailUrl: null,
		published: true,
		displayOrder: 0,
		publishedAt: null,
		pricingModel: 'Free',
		priceAmount: null,
		issuesCertificate: true,
		isFeatured: false,
		areaIds: [],
		createdAt: '2026-01-01T00:00:00Z',
		updatedAt: '2026-01-01T00:00:00Z',
		...overrides,
	};
}

function buildModule(overrides: Partial<CourseModule>): CourseModule {
	return {
		id: 'module-1',
		courseId: 'course-1',
		title: 'Módulo 1',
		description: '',
		displayOrder: 0,
		published: true,
		lessons: [],
		...overrides,
	};
}

test('resolves a lesson to its course title and module-scoped position', () => {
	const course = buildCourse({ id: 'course-1', title: 'Curso de Batismo' });
	const courseModule = buildModule({
		id: 'module-1',
		courseId: 'course-1',
		lessons: [
			{
				id: 'lesson-1',
				moduleId: 'module-1',
				title: 'Aula 1',
				description: '',
				displayOrder: 0,
				freePreview: true,
				published: true,
				videoId: null,
				durationSeconds: null,
			},
			{
				id: 'lesson-2',
				moduleId: 'module-1',
				title: 'Aula 2',
				description: '',
				displayOrder: 1,
				freePreview: false,
				published: true,
				videoId: null,
				durationSeconds: null,
			},
		],
	});

	const lookup = buildLessonLookup([course], [[courseModule]]);

	assert.deepEqual(lookup.get('lesson-2'), {
		courseTitle: 'Curso de Batismo',
		lessonTitle: 'Aula 2',
		modulePosition: 2,
	});
});

test('returns an empty lookup for courses with no modules loaded yet', () => {
	const course = buildCourse({ id: 'course-1' });
	const lookup = buildLessonLookup([course], [[]]);

	assert.equal(lookup.size, 0);
});

test('does not resolve a lesson id that is not in any loaded module', () => {
	const course = buildCourse({ id: 'course-1' });
	const courseModule = buildModule({ courseId: 'course-1', lessons: [] });

	const lookup = buildLessonLookup([course], [[courseModule]]);

	assert.equal(lookup.get('unknown-lesson'), undefined);
});
