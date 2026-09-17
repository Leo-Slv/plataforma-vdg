import { StatusToggle } from '@/features/admin/components/status-toggle';
import type { Area } from '@/features/admin/model/area';

type AreaAccessToggleListProps = {
	areas: Area[];
	pendingGrantedAreaIds: Set<string>;
	roleGrantedAreaIds: Set<string>;
	onToggle: (areaId: string) => void;
};

function AreaAccessToggleList({
	areas,
	pendingGrantedAreaIds,
	roleGrantedAreaIds,
	onToggle,
}: AreaAccessToggleListProps) {
	return (
		<div className="flex flex-col gap-2">
			{areas.map((area) => {
				const grantedByRole = roleGrantedAreaIds.has(area.id);

				return (
					<StatusToggle
						key={area.id}
						label={area.name}
						checked={grantedByRole || pendingGrantedAreaIds.has(area.id)}
						onChange={() => onToggle(area.id)}
						disabled={grantedByRole}
						helperText={
							grantedByRole
								? 'Liberada pelo papel do usuário — este controle não tem efeito aqui.'
								: undefined
						}
					/>
				);
			})}
		</div>
	);
}

export { AreaAccessToggleList };
