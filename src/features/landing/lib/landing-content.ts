import { appRoutes } from '@/lib/routes/app-routes';

const heroContent = {
	eyebrow: 'Escola de Discipulado · 2026',
	headlineLines: ['Ensino que', 'sustenta a', 'sua caminhada.'],
	headlineMobile: 'Ensino que sustenta a sua caminhada.',
	subtext:
		'Cursos gratuitos e formações completas da Igreja Viver da Graça. Você começa hoje, no seu ritmo, com acompanhamento de quem já caminhou antes.',
	subtextMobile:
		'Cursos gratuitos e formações da Igreja Viver da Graça, no seu ritmo.',
	primaryCtaLabel: 'Começar gratuitamente',
	secondaryCtaLabel: 'Ver o catálogo',
} as const;

const howItWorksIntro =
	'Cada curso pertence a uma área. Você cria a conta, confirma o e-mail e já entra nos cursos gratuitos da sua área. Formações e conferências são liberadas por inscrição.';

const howItWorksSteps = [
	{
		step: '01',
		title: 'Crie sua conta',
		description: 'Nome, e-mail e senha. Leva menos de um minuto.',
	},
	{
		step: '02',
		title: 'Confirme o e-mail',
		description: 'É o passo que libera o acesso às aulas.',
	},
	{
		step: '03',
		title: 'Estude e avance',
		description: 'Seu progresso é salvo aula por aula, em qualquer aparelho.',
	},
] as const;

const footerContent = {
	orgName: 'Igreja Viver da Graça',
	schoolName: 'Escola de Discipulado',
	links: [
		{ label: 'Termos', href: appRoutes.legal.terms },
		{ label: 'Privacidade', href: appRoutes.legal.privacy },
	],
	copyrightYear: 2026,
} as const;

const featuredFormationCopy = {
	eyebrow: 'Formação em destaque',
	primaryCtaLabel: 'Inscrever-se',
	secondaryCtaLabel: 'Saiba mais →',
} as const;

const closingCtaContent = {
	headline: 'Comece sua jornada hoje.',
	subtext:
		'Crie sua conta gratuita e tenha acesso imediato aos cursos abertos da sua área.',
	primaryCtaLabel: 'Criar conta gratuita',
	secondaryCtaLabel: 'Ver o catálogo',
} as const;

export {
	heroContent,
	howItWorksIntro,
	howItWorksSteps,
	footerContent,
	featuredFormationCopy,
	closingCtaContent,
};
