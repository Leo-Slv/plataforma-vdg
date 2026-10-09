type LegalSection = {
	heading: string;
	paragraphs: string[];
};

type LegalDocument = {
	title: string;
	intro: string;
	sections: LegalSection[];
};

const ORG = 'Igreja Viver da Graça';

/**
 * DRAFT texts. They describe what the platform actually does today (data it
 * collects, who processes it) so they are a faithful starting point, but they
 * are NOT legal advice: they must be reviewed by whoever is legally
 * responsible for the church before being treated as final. The pages show
 * that notice to readers until the flag below is flipped.
 */
const LEGAL_DRAFT_NOTICE =
	'Minuta em revisão — este texto ainda será validado pela igreja antes da versão final.';

const termsDocument: LegalDocument = {
	title: 'Termos de uso',
	intro: `Estes termos regulam o uso da plataforma de cursos da ${ORG} (Escola de Discipulado). Ao criar uma conta, você declara que leu e concorda com eles.`,
	sections: [
		{
			heading: '1. Conta',
			paragraphs: [
				'Para acessar os cursos é preciso criar uma conta com nome, e-mail e senha. Você é responsável por manter sua senha em sigilo e pelas ações feitas na sua conta.',
				'Enquanto o e-mail não for confirmado, o catálogo fica visível, mas as aulas permanecem bloqueadas — inclusive nos cursos gratuitos.',
			],
		},
		{
			heading: '2. Cursos e acesso',
			paragraphs: [
				'Os cursos podem ser gratuitos, pagos ou liberados mediante inscrição analisada pela equipe da igreja. O acesso a cada curso é pessoal e intransferível.',
				'O conteúdo (vídeos, textos e materiais) é protegido por direitos autorais. É proibido copiar, redistribuir ou publicar o conteúdo sem autorização.',
			],
		},
		{
			heading: '3. Pagamentos',
			paragraphs: [
				'Cursos pagos são cobrados uma única vez, em reais, por meio do Stripe. A plataforma não recebe nem armazena os dados do seu cartão.',
				'O acesso ao curso é liberado depois da confirmação do pagamento pelo Stripe. Pedidos de cancelamento ou reembolso devem ser feitos à equipe de suporte.',
			],
		},
		{
			heading: '4. Conduta',
			paragraphs: [
				'Perguntas, anotações e depoimentos enviados na plataforma devem ser respeitosos. Conteúdo ofensivo ou impróprio pode ser removido e a conta, suspensa.',
			],
		},
		{
			heading: '5. Alterações e contato',
			paragraphs: [
				'Estes termos podem ser atualizados; a versão em vigor é sempre a publicada nesta página. Dúvidas podem ser enviadas à equipe de suporte indicada no rodapé do site.',
			],
		},
	],
};

const privacyDocument: LegalDocument = {
	title: 'Política de privacidade',
	intro: `Esta política explica como a ${ORG} trata os dados pessoais coletados na plataforma de cursos, conforme a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).`,
	sections: [
		{
			heading: '1. Dados que coletamos',
			paragraphs: [
				'Conta: nome, e-mail, senha (guardada de forma criptografada) e, opcionalmente, telefone e foto de perfil.',
				'Uso: cursos acessados, progresso nas aulas, anotações, perguntas, depoimentos e certificados emitidos.',
				'Formulário "Primeira vez": nome, telefone, e-mail e, opcionalmente, endereço de quem visita a igreja, para que a equipe entre em contato.',
				'Compras: histórico de pedidos (curso, valor e status). Os dados do cartão são tratados diretamente pelo Stripe.',
			],
		},
		{
			heading: '2. Para que usamos',
			paragraphs: [
				'Para criar e manter sua conta, liberar o acesso aos cursos, registrar seu progresso, emitir certificados, processar pagamentos, enviar e-mails de confirmação e de redefinição de senha e, no caso do formulário "Primeira vez", entrar em contato com o visitante.',
			],
		},
		{
			heading: '3. Com quem compartilhamos',
			paragraphs: [
				'Usamos prestadores de serviço que tratam dados em nosso nome: Stripe (pagamentos), Resend (envio de e-mails), Cloudflare Turnstile (proteção contra abuso) e provedores de hospedagem e armazenamento. Não vendemos seus dados.',
			],
		},
		{
			heading: '4. Cookies e armazenamento no navegador',
			paragraphs: [
				'Usamos um cookie de sessão (restrito ao servidor) para manter você conectado e armazenamento local do navegador para guardar sua sessão ativa. Não usamos cookies de publicidade.',
			],
		},
		{
			heading: '5. Seus direitos',
			paragraphs: [
				'Você pode solicitar confirmação do tratamento, acesso, correção, anonimização ou exclusão dos seus dados, e revogar consentimentos, entrando em contato com a equipe de suporte indicada no rodapé do site.',
			],
		},
		{
			heading: '6. Retenção e segurança',
			paragraphs: [
				'Mantemos os dados enquanto sua conta existir ou pelo tempo necessário para cumprir obrigações legais. Adotamos medidas técnicas para proteger as informações, como senhas criptografadas e conexão segura.',
			],
		},
	],
};

export { termsDocument, privacyDocument, LEGAL_DRAFT_NOTICE };
export type { LegalDocument, LegalSection };
