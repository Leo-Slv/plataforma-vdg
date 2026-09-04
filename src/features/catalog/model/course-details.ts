type Lesson = {
	id: string;
	title: string;
	description: string;
	displayOrder: number;
	freePreview: boolean;
	published: boolean;
};

type CourseModule = {
	id: string;
	title: string;
	description: string;
	displayOrder: number;
	published: boolean;
	lessons: Lesson[];
};

type CourseDetails = {
	id: string;
	title: string;
	slug: string;
	description: string;
	thumbnailUrl: string | null;
	pricingModel: 'Free' | 'Paid';
	areaIds: string[];
	modules: CourseModule[];
};

export type { Lesson, CourseModule, CourseDetails };
