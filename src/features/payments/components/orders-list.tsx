import Link from 'next/link';

import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes/app-routes';
import { formatAmountInCents } from '@/features/payments/lib/format-amount-in-cents';
import {
	orderStatusView,
	type OrderStatusTone,
} from '@/features/payments/lib/order-status';
import type { Order } from '@/features/payments/model/order';

type OrderCourse = {
	title: string;
	slug: string;
};

type OrdersListProps = {
	orders: Order[];
	coursesById: Record<string, OrderCourse | undefined>;
};

const TONE_CLASS: Record<OrderStatusTone, string> = {
	success: 'bg-[oklch(0.75_0.1_248)]/15 text-[oklch(0.75_0.1_248)]',
	pending: 'bg-foreground/8 text-foreground/70',
	danger: 'bg-[oklch(0.704_0.191_22.216)]/15 text-[oklch(0.704_0.191_22.216)]',
	neutral: 'bg-foreground/6 text-foreground/45',
};

function formatOrderDate(iso: string): string {
	return new Date(iso).toLocaleDateString('pt-BR');
}

function OrdersList({ orders, coursesById }: OrdersListProps) {
	if (orders.length === 0) {
		return (
			<div className="flex flex-col items-center gap-4 py-16 text-center">
				<p className="font-sans text-sm font-light text-foreground/50">
					Você ainda não fez nenhuma compra.
				</p>
				<Link
					href={appRoutes.catalog.index}
					className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
				>
					Explorar o catálogo
				</Link>
			</div>
		);
	}

	return (
		<ul className="flex flex-col">
			{orders.map((order) => {
				const course = coursesById[order.courseId];
				const status = orderStatusView(order.status);

				return (
					<li
						key={order.id}
						className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/8 py-4.5"
					>
						<div className="min-w-0">
							{course ? (
								<Link
									href={appRoutes.courses.detail(course.slug)}
									className="font-heading text-[16px] text-foreground"
								>
									{course.title}
								</Link>
							) : (
								<span className="font-heading text-[16px] text-foreground/70">
									Curso indisponível
								</span>
							)}
							<div className="mt-1 font-sans text-[12px] font-light text-foreground/40">
								{formatOrderDate(order.createdAt)}
							</div>
						</div>
						<div className="flex items-center gap-4">
							<span className="font-sans text-[14px] text-foreground/80">
								{formatAmountInCents(order.amountInCents, order.currency)}
							</span>
							<span
								className={cn(
									'rounded-full px-3 py-1.5 font-heading text-[10px] tracking-[0.12em] whitespace-nowrap uppercase',
									TONE_CLASS[status.tone],
								)}
							>
								{status.label}
							</span>
						</div>
					</li>
				);
			})}
		</ul>
	);
}

export { OrdersList };
export type { OrderCourse };
