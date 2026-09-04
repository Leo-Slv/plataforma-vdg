type AreaSummary = {
	id: string;
	name: string;
	slug: string;
	displayOrder: number;
};

type CourseCatalogItem = {
	id: string;
	title: string;
	slug: string;
	description: string;
	thumbnailUrl: string | null;
	displayOrder: number;
	pricingModel: 'Free' | 'Paid';
	areaIds: string[];
	hasAccess: boolean;
};

type CourseCatalog = {
	areas: AreaSummary[];
	courses: CourseCatalogItem[];
};

export type { AreaSummary, CourseCatalogItem, CourseCatalog };
