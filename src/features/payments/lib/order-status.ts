type OrderStatusTone = 'success' | 'pending' | 'danger' | 'neutral';

type OrderStatusView = {
	label: string;
	tone: OrderStatusTone;
};

const STATUS_VIEWS: Record<string, OrderStatusView> = {
	Pending: { label: 'Aguardando pagamento', tone: 'pending' },
	Paid: { label: 'Pago', tone: 'success' },
	Expired: { label: 'Expirado', tone: 'neutral' },
	Failed: { label: 'Falhou', tone: 'danger' },
};

function orderStatusView(status: string): OrderStatusView {
	return STATUS_VIEWS[status] ?? { label: status, tone: 'neutral' };
}

function isSettledOrderStatus(status: string): boolean {
	return status !== 'Pending';
}

export { orderStatusView, isSettledOrderStatus };
export type { OrderStatusTone, OrderStatusView };
