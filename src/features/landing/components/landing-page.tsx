'use client';

import {
	usePublicCatalogSummaryQuery,
	usePublicTestimonialsQuery,
} from '@/features/landing/hooks/landing.queries';
import { LandingHeader } from '@/features/landing/components/landing-header';
import { LandingHero } from '@/features/landing/components/landing-hero';
import { FeaturedCoursesSection } from '@/features/landing/components/featured-courses-section';
import { HowItWorksSection } from '@/features/landing/components/how-it-works-section';
import { AreasGridSection } from '@/features/landing/components/areas-grid-section';
import { FeaturedFormationSection } from '@/features/landing/components/featured-formation-section';
import { TestimonialsSection } from '@/features/landing/components/testimonials-section';
import { ClosingCtaSection } from '@/features/landing/components/closing-cta-section';
import { LandingFooter } from '@/features/landing/components/landing-footer';

function LandingPage() {
	const summaryQuery = usePublicCatalogSummaryQuery();
	const testimonialsQuery = usePublicTestimonialsQuery();

	const summary = summaryQuery.isSuccess ? summaryQuery.data : undefined;
	const testimonials = testimonialsQuery.isSuccess
		? testimonialsQuery.data
		: [];

	return (
		<div className="bg-background text-foreground">
			<LandingHeader />
			<LandingHero
				stats={
					summary
						? {
								activeAreaCount: summary.activeAreaCount,
								publishedCourseCount: summary.publishedCourseCount,
							}
						: undefined
				}
			/>
			<FeaturedCoursesSection liveCourses={summary?.featuredCourses} />
			<HowItWorksSection />
			{summary && summary.areas.length > 0 ? (
				<AreasGridSection areas={summary.areas} />
			) : null}
			{summary?.highlightedCourse ? (
				<FeaturedFormationSection course={summary.highlightedCourse} />
			) : null}
			{testimonials.length > 0 ? (
				<TestimonialsSection testimonials={testimonials} />
			) : null}
			<ClosingCtaSection />
			<LandingFooter />
		</div>
	);
}

export { LandingPage };
