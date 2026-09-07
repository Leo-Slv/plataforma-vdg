import type { Area } from '@/features/admin/model/area';

function sortAreasByDisplayOrder(areas: Area[]): Area[] {
	return [...areas].sort((a, b) => a.displayOrder - b.displayOrder);
}

export { sortAreasByDisplayOrder };
