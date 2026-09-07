'use client';

import type { PricingModel } from '@/features/admin/lib/resolve-price-amount';

type PricingModelPickerProps = {
	value: PricingModel;
	priceAmount: string;
	priceError?: string;
	onChangeModel: (value: PricingModel) => void;
	onChangePriceAmount: (value: string) => void;
};

const OPTIONS: { value: PricingModel; label: string }[] = [
	{ value: 'Free', label: 'Gratuito para a área' },
	{ value: 'Paid', label: 'Pago' },
	{ value: 'EnrollmentControlled', label: 'Por inscrição (turma controlada)' },
];

function PricingModelPicker({
	value,
	priceAmount,
	priceError,
	onChangeModel,
	onChangePriceAmount,
}: PricingModelPickerProps) {
	return (
		<div>
			<span className="mb-2.25 block font-heading text-[10px] tracking-[0.14em] text-white/40 uppercase">
				Modelo de cobrança
			</span>
			<div className="flex flex-col">
				{OPTIONS.map((option) => (
					<label
						key={option.value}
						className="flex items-center gap-3 border-t border-white/10 py-3.5"
					>
						<input
							type="radio"
							name="pricingModel"
							value={option.value}
							checked={value === option.value}
							onChange={() => onChangeModel(option.value)}
							className="size-4"
						/>
						<span className="font-sans text-[13.5px] font-light text-white/70">
							{option.label}
						</span>
						{option.value === 'Paid' && value === 'Paid' ? (
							<input
								type="number"
								step="0.01"
								min="0"
								value={priceAmount}
								onChange={(event) => onChangePriceAmount(event.target.value)}
								placeholder="R$ 0,00"
								className="ml-auto w-32 rounded-md border border-white/12 bg-[#141416] px-3 py-2 font-sans text-[13px] text-[#f2f2f0] outline-none"
							/>
						) : null}
					</label>
				))}
			</div>
			{priceError ? (
				<p className="mt-2 text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
					{priceError}
				</p>
			) : null}
		</div>
	);
}

export { PricingModelPicker };
