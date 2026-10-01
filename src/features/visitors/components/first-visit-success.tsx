import { firstName } from '@/features/visitors/lib/first-name';

type FirstVisitSuccessProps = {
	name: string;
	phone: string;
	onReset: () => void;
};

function FirstVisitSuccess({ name, phone, onReset }: FirstVisitSuccessProps) {
	return (
		<div role="status" className="mt-15 flex flex-col gap-4.5 lg:mt-0 lg:py-6">
			<div
				aria-hidden
				className="flex size-13 items-center justify-center rounded-full border border-[oklch(0.62_0.1_248)] text-[22px] leading-none font-light text-[oklch(0.75_0.1_248)]"
			>
				✓
			</div>
			<p className="font-heading text-[32px] leading-[1.15] font-light lg:text-[30px]">
				Obrigado, {firstName(name)}.
			</p>
			<p className="text-[15px] leading-[1.65] font-light text-pretty text-foreground/60">
				Recebemos seus dados. Nossa equipe vai falar com você pelo telefone{' '}
				{phone} em breve.
			</p>
			<button
				type="button"
				onClick={onReset}
				className="mt-3 rounded-full border border-foreground/20 bg-transparent p-4.25 text-[15px] leading-none text-foreground lg:mt-2 lg:self-start lg:px-6 lg:py-3.5 lg:text-[14px]"
			>
				Cadastrar outra pessoa
			</button>
		</div>
	);
}

export { FirstVisitSuccess };
