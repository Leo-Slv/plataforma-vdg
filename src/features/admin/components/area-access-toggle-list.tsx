import { StatusToggle } from '@/features/admin/components/status-toggle';
import type { Area } from '@/features/admin/model/area';

type AreaAccessToggleListProps = {
	areas: Area[];
	pendingGrantedAreaIds: Set<string>;
	onToggle: (areaId: string) => void;
};

function AreaAccessToggleList({
	areas,
	pendingGrantedAreaIds,
	onToggle,
}: AreaAccessToggleListProps) {
	return (
		<div className="flex flex-col gap-2">
			{areas.map((area) => (
				<StatusToggle
					key={area.id}
					label={area.name}
					checked={pendingGrantedAreaIds.has(area.id)}
					onChange={() => onToggle(area.id)}
				/>
			))}
		</div>
	);
}

export { AreaAccessToggleList };
