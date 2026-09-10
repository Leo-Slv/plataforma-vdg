import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';

type AuditLogEntryView = {
	id: string;
	label: string;
	relativeTime: string;
};

type AuditLogPanelProps =
	| { status: 'ready'; entries: AuditLogEntryView[] }
	| { status: 'forbidden' }
	| { status: 'error'; onRetry: () => void };

function AuditLogPanel(props: AuditLogPanelProps) {
	return (
		<div className="mt-8.5 rounded-md border border-white/10 bg-[#101012] px-6 py-5.5">
			<div className="flex items-center justify-between">
				<span className="font-heading text-[10px] tracking-[0.16em] text-white/40 uppercase">
					Últimas ações auditadas
				</span>
				{props.status === 'ready' && props.entries.length > 0 ? (
					<Link
						href={appRoutes.admin.audit}
						className="font-sans text-[12px] text-[oklch(0.72_0.1_248)]"
					>
						Ver tudo →
					</Link>
				) : null}
			</div>

			{props.status === 'forbidden' ? (
				<p className="mt-4 font-sans text-[12.5px] font-light text-white/40">
					Sem permissão para ver auditoria.
				</p>
			) : props.status === 'error' ? (
				<div className="mt-4 flex items-center justify-between">
					<p className="font-sans text-[12.5px] font-light text-white/50">
						Não foi possível carregar as ações auditadas.
					</p>
					<button
						type="button"
						onClick={props.onRetry}
						className="font-sans text-[12.5px] text-white/60 underline"
					>
						Tentar novamente
					</button>
				</div>
			) : props.entries.length === 0 ? (
				<p className="mt-4 font-sans text-[12.5px] font-light text-white/40">
					Nenhuma ação registrada ainda.
				</p>
			) : (
				<div className="mt-4 flex flex-col gap-3.25 font-sans text-[12.5px] text-white/55">
					{props.entries.map((entry) => (
						<div key={entry.id} className="flex justify-between gap-4">
							<span>{entry.label}</span>
							<span className="text-white/30">{entry.relativeTime}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export { AuditLogPanel };
export type { AuditLogEntryView };
