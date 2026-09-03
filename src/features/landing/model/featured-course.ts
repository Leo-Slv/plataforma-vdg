type FeaturedCoursePrice = 'free' | { amountLabel: string };

type FeaturedCourse = {
	slug: string;
	title: string;
	category: string;
	moduleCount: number;
	lessonCount: number;
	durationLabel: string;
	price: FeaturedCoursePrice;
	statusLabel: string;
};

export type { FeaturedCourse, FeaturedCoursePrice };
