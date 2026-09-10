'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';

type AdminModalProps = {
	title: string;
	onClose: () => void;
	children: ReactNode;
};

function AdminModal({ title, onClose, children }: AdminModalProps) {
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				onClose();
			}
		}
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
			onClick={onClose}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={title}
				onClick={(event) => event.stopPropagation()}
				className="w-full max-w-md rounded-lg border border-foreground/12 bg-surface-2 p-6.5"
			>
				<h2 className="font-heading text-[20px] font-light text-foreground">
					{title}
				</h2>
				<div className="mt-5.5">{children}</div>
			</div>
		</div>
	);
}

export { AdminModal };
