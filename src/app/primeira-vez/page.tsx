import type { Metadata } from 'next';

import { FirstVisitPage } from '@/features/visitors/components/first-visit-page';

export const metadata: Metadata = {
	title: 'Primeira vez — Viver da Graça',
	description:
		'Deixe seus dados para a equipe de recepção da Igreja Viver da Graça entrar em contato.',
};

export default function FirstVisit() {
	return <FirstVisitPage />;
}
