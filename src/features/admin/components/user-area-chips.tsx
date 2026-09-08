import { useUserAreaAccessQuery } from '@/features/admin/hooks/admin.queries';
import { AreaChips } from '@/features/admin/components/area-chips';
import type { Area } from '@/features/admin/model/area';

type UserAreaChipsProps = {
	userId: string;
	roleNames: string[];
	areas: Area[];
};

function UserAreaChips({ userId, roleNames, areas }: UserAreaChipsProps) {
	const isAdmin = roleNames.includes('Admin');
	const query = useUserAreaAccessQuery(userId, { enabled: !isAdmin });

	if (isAdmin) {
		return <AreaChips status="admin" names={[]} />;
	}

	if (query.isPending) {
		return <AreaChips status="pending" names={[]} />;
	}

	if (query.isError) {
		return <AreaChips status="error" names={[]} />;
	}

	const names = query.data
		.map((access) => areas.find((area) => area.id === access.areaId)?.name)
		.filter((name): name is string => Boolean(name));

	return <AreaChips status="ready" names={names} />;
}

export { UserAreaChips };
