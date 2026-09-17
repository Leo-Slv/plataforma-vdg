'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { MotionConfig } from 'motion/react';

function ThemeProvider({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="dark"
			enableSystem={false}
			storageKey="vdg-theme"
		>
			{/* Respects prefers-reduced-motion for every motion.* animation in
			    the app: transforms (our y-offset fade-ups included) are skipped,
			    opacity fades still play. */}
			<MotionConfig reducedMotion="user">{children}</MotionConfig>
		</NextThemesProvider>
	);
}

export { ThemeProvider };
