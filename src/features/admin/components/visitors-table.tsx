import { cn } from '@/lib/utils';
import { maskPhone } from '@/features/visitors/lib/phone-mask';
import { formatDateTimeBr } from '@/features/admin/lib/format-date-time-br';
import type { Visitor } from '@/features/admin/model/visitor';

type VisitorsTableProps = {
	visitors: Visitor[];
	pendingId: string | null;
	canToggle: boolean;
	onToggle: (visitorId: string, contacted: boolean) => void;
};

const COLUMNS = 'grid-cols-[0.8fr_2fr_1.2fr_2fr_1.4fr]';

function VisitorsTable({
	visitors,
	pendingId,
	canToggle,
	onToggle,
}: VisitorsTableProps) {
	if (visitors.length === 0) {
		return (
			<p className="py-12 text-center font-sans text-sm font-light text-foreground/45">
				Nenhum visitante encontrado.
			</p>
		);
	}

	return (
		<div className="overflow-x-auto">
			<div
				className={cn(
					'grid min-w-[760px] gap-4 border-b border-foreground/12 pb-3 font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase',
					COLUMNS,
				)}
			>
				<span>Contatado</span>
				<span>Visitante</span>
				<span>Telefone</span>
				<span>Endereço</span>
				<span>Recebido em</span>
			</div>

			{visitors.map((visitor) => (
				<div
					key={visitor.id}
					className={cn(
						'grid min-w-[760px] items-center gap-4 border-b border-foreground/7 py-4 font-sans text-[13px] text-foreground/75',
						COLUMNS,
						visitor.contacted && 'bg-foreground/2',
					)}
				>
					<div className="flex flex-col gap-1">
						<input
							type="checkbox"
							checked={visitor.contacted}
							disabled={!canToggle || pendingId === visitor.id}
							onChange={(event) => onToggle(visitor.id, event.target.checked)}
							aria-label={`Marcar ${visitor.name} como contatado`}
							className="size-4.5 cursor-pointer accent-[oklch(0.72_0.1_248)] disabled:cursor-not-allowed disabled:opacity-50"
						/>
						{visitor.contacted && visitor.contactedAt ? (
							<span className="font-sans text-[11px] font-light text-foreground/40">
								{formatDateTimeBr(visitor.contactedAt)}
							</span>
						) : null}
					</div>
					<div>
						<div
							className={cn(
								'font-heading text-[14px]',
								visitor.contacted
									? 'text-foreground/50 line-through decoration-foreground/25'
									: 'text-foreground',
							)}
						>
							{visitor.name}
						</div>
						<div className="mt-1 font-sans text-[11px] font-light text-foreground/35">
							{visitor.email}
						</div>
					</div>
					<span className="text-foreground/65">{maskPhone(visitor.phone)}</span>
					<span className="text-foreground/55">{visitor.address ?? '—'}</span>
					<span className="text-foreground/40">
						{formatDateTimeBr(visitor.submittedAt)}
					</span>
				</div>
			))}
		</div>
	);
}

export { VisitorsTable };
