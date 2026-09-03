import { LandingHeader } from '@/features/landing/components/landing-header';
import { LandingHero } from '@/features/landing/components/landing-hero';
import { FeaturedCoursesSection } from '@/features/landing/components/featured-courses-section';
import { HowItWorksSection } from '@/features/landing/components/how-it-works-section';
import { LandingFooter } from '@/features/landing/components/landing-footer';

function LandingPage() {
	return (
		<div className="bg-[#0a0a0b] text-[#f2f2f0]">
			<LandingHeader />
			<LandingHero />
			<FeaturedCoursesSection />
			<HowItWorksSection />
			<LandingFooter />
		</div>
	);
}

export { LandingPage };
