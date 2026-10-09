import Image from 'next/image';
import type { ReactNode } from 'react';

type AuthScreenProps = {
	title: string;
	subtitle?: ReactNode;
	children: ReactNode;
};

/** The shared logo + heading shell of the public auth screens. */
function AuthScreen({ title, subtitle, children }: AuthScreenProps) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-5 py-11 text-foreground sm:px-6">
			<div className="w-full max-w-[520px] px-6 pt-9 pb-8 sm:px-0">
				<Image
					src="/brand/viver-da-graca-mark.png"
					alt="Viver da Graça"
					width={52}
					height={52}
					className="size-13 rounded-full object-cover"
				/>

				<h1 className="mt-6.5 font-heading text-[34px] leading-[1.15] font-extralight">
					{title}
				</h1>
				{subtitle ? (
					<p className="mt-2.5 text-[14px] leading-[1.6] font-light text-foreground/50">
						{subtitle}
					</p>
				) : null}

				{children}
			</div>
		</div>
	);
}

export { AuthScreen };
