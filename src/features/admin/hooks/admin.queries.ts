import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';
import { getAreas } from '@/features/admin/api/get-areas';
import { getArea } from '@/features/admin/api/get-area';
import { createArea } from '@/features/admin/api/create-area';
import { updateArea } from '@/features/admin/api/update-area';

function useAreasQuery(options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.admin.areas,
		queryFn: getAreas,
		enabled: options.enabled,
	});
}

function useAreaQuery(areaId: string, options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.admin.area(areaId),
		queryFn: () => getArea(areaId),
		enabled: options.enabled && areaId.length > 0,
		retry: false,
	});
}

function useCreateAreaMutation() {
	return useMutation({
		mutationFn: createArea,
	});
}

function useUpdateAreaMutation() {
	return useMutation({
		mutationFn: ({
			areaId,
			payload,
		}: {
			areaId: string;
			payload: Parameters<typeof updateArea>[1];
		}) => updateArea(areaId, payload),
	});
}

export {
	useAreasQuery,
	useAreaQuery,
	useCreateAreaMutation,
	useUpdateAreaMutation,
};
