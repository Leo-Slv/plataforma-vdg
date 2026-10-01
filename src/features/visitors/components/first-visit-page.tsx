import { FirstVisitHeader } from '@/features/visitors/components/first-visit-header';
import { FirstVisitLayout } from '@/features/visitors/components/first-visit-layout';

function FirstVisitPage() {
	return (
		<div className="flex min-h-screen flex-col bg-background text-foreground">
			<FirstVisitHeader />
			<FirstVisitLayout />
		</div>
	);
}

export { FirstVisitPage };
