import type { FeaturedCourse } from '@/features/landing/model/featured-course';

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
	stats: [
		{ value: '6', label: 'áreas de ensino' },
		{ value: '18', label: 'cursos publicados' },
		{ value: '11', label: 'anos de igreja' },
	],
} as const;

const featuredCourses: FeaturedCourse[] = [
	{
		slug: 'fundamentos-da-fe',
		title: 'Fundamentos da Fé',
		category: 'Discipulado',
		moduleCount: 6,
		lessonCount: 24,
		durationLabel: '7h',
		price: 'free',
		statusLabel: 'Aberto para toda a igreja',
	},
	{
		slug: 'curso-de-batismo',
		title: 'Curso de Batismo',
		category: 'Discipulado',
		moduleCount: 3,
		lessonCount: 9,
		durationLabel: '2h 30min',
		price: 'free',
		statusLabel: 'Turmas novas todo mês',
	},
	{
		slug: 'escola-de-lideres',
		title: 'Escola de Líderes',
		category: 'Liderança',
		moduleCount: 8,
		lessonCount: 41,
		durationLabel: '12h',
		price: { amountLabel: 'R$ 149' },
		statusLabel: '2 aulas liberadas · certificado',
	},
];

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
	linkLabels: ['Termos', 'Privacidade', 'Suporte'],
	copyrightYear: 2026,
} as const;

export {
	heroContent,
	featuredCourses,
	howItWorksIntro,
	howItWorksSteps,
	footerContent,
};
