import Image from 'next/image';

function LoadingScreen() {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
			<div className="relative flex size-[200px] items-center justify-center">
				<div className="absolute inset-0 rounded-full border-2 border-foreground/8" />
				<div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[oklch(0.72_0.12_248)] border-r-[oklch(0.72_0.12_248_/_0.35)]" />
				<Image
					src="/brand/viver-da-graca-mark.png"
					alt="Viver da Graça"
					width={150}
					height={150}
					className="size-[150px] rounded-full object-cover shadow-[0_0_24px_oklch(0.55_0.12_248_/_0.5)]"
				/>
			</div>
		</div>
	);
}

export { LoadingScreen };
