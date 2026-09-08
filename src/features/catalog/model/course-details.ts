type Lesson = {
	id: string;
	title: string;
	description: string;
	displayOrder: number;
	freePreview: boolean;
	published: boolean;
	videoId: string | null;
	durationSeconds: number | null;
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
	pricingModel: 'Free' | 'Paid' | 'EnrollmentControlled';
	priceAmount: number | null;
	hasAccess: boolean;
	certificateIssued: boolean;
	areaIds: string[];
	modules: CourseModule[];
};

export type { Lesson, CourseModule, CourseDetails };
