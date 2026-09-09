import { StatusToggle } from '@/features/admin/components/status-toggle';
import type { Role } from '@/features/admin/model/role';

type RoleAccessToggleListProps = {
	roles: Role[];
	pendingRoleIds: Set<string>;
	onToggle: (roleId: string) => void;
};

function RoleAccessToggleList({
	roles,
	pendingRoleIds,
	onToggle,
}: RoleAccessToggleListProps) {
	return (
		<div className="flex flex-col gap-2">
			{roles.map((role) => (
				<StatusToggle
					key={role.id}
					label={role.name}
					checked={pendingRoleIds.has(role.id)}
					onChange={() => onToggle(role.id)}
				/>
			))}
		</div>
	);
}

export { RoleAccessToggleList };
