'use client';

import {
	describePermission,
	listAssignablePermissions,
} from '@/features/admin/lib/permission-labels';
import { StatusToggle } from '@/features/admin/components/status-toggle';
import type { Permission } from '@/features/admin/model/role-detail';

type RolePermissionsEditorProps = {
	permissions: Permission[];
	selectedKeys: ReadonlySet<string>;
	onToggle: (key: string, granted: boolean) => void;
	disabled?: boolean;
};

function RolePermissionsEditor({
	permissions,
	selectedKeys,
	onToggle,
	disabled = false,
}: RolePermissionsEditorProps) {
	return (
		<div className="flex flex-col gap-2">
			{listAssignablePermissions(permissions).map((permission) => {
				const { label, description } = describePermission(permission);

				return (
					<StatusToggle
						key={permission.key}
						label={label}
						helperText={description}
						checked={selectedKeys.has(permission.key)}
						disabled={disabled}
						onChange={(granted) => onToggle(permission.key, granted)}
					/>
				);
			})}
		</div>
	);
}

export { RolePermissionsEditor };
