import type { Metadata } from 'next';
import { Jost, DM_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { AppQueryProvider } from '@/lib/query/providers';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const jost = Jost({
	variable: '--font-jost',
	subsets: ['latin'],
	weight: ['200', '300', '400', '500'],
});

const dmSans = DM_Sans({
	variable: '--font-dm-sans',
	subsets: ['latin'],
	weight: ['300', '400', '500'],
});

export const metadata: Metadata = {
	title: 'Viver da Graça — Escola de Discipulado',
	description:
		'Cursos gratuitos e formações completas da Igreja Viver da Graça.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
	return (
		<html
			lang="pt-BR"
			suppressHydrationWarning
			className={cn(
				'h-full',
				'antialiased',
				'font-sans',
				jost.variable,
				dmSans.variable,
			)}
		>
			<body className="flex min-h-full flex-col">
				<ThemeProvider>
					<AppQueryProvider>
						{children}
						<Toaster />
					</AppQueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
