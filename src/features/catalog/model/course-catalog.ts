type AreaSummary = {
	id: string;
	name: string;
	slug: string;
	description: string;
	displayOrder: number;
};

type CourseCatalogItem = {
	id: string;
	title: string;
	slug: string;
	description: string;
	thumbnailUrl: string | null;
	displayOrder: number;
	pricingModel: 'Free' | 'Paid' | 'EnrollmentControlled';
	priceAmount: number | null;
	areaIds: string[];
	hasAccess: boolean;
	moduleCount: number;
	lessonCount: number;
	durationSeconds: number;
	certificateIssued: boolean;
};

type CourseCatalog = {
	areas: AreaSummary[];
	courses: CourseCatalogItem[];
};

export type { AreaSummary, CourseCatalogItem, CourseCatalog };
