'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

function ThemeProvider({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="dark"
			enableSystem={false}
			storageKey="vdg-theme"
		>
			{children}
		</NextThemesProvider>
	);
}

export { ThemeProvider };
