import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';
import { getAreas } from '@/features/admin/api/get-areas';
import { getArea } from '@/features/admin/api/get-area';
import { createArea } from '@/features/admin/api/create-area';
import { updateArea } from '@/features/admin/api/update-area';
import { getCourses } from '@/features/admin/api/get-courses';
import { getAuditLogs } from '@/features/admin/api/get-audit-logs';
import { createCourse } from '@/features/admin/api/create-course';
import { updateCourse } from '@/features/admin/api/update-course';
import { publishCourse } from '@/features/admin/api/publish-course';
import { unpublishCourse } from '@/features/admin/api/unpublish-course';

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

function useCoursesQuery(options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.admin.courses,
		queryFn: getCourses,
		enabled: options.enabled,
	});
}

function useAuditLogsQuery(
	page: number,
	pageSize: number,
	options: { enabled: boolean },
) {
	return useQuery({
		queryKey: queryKeys.admin.auditLogs(page, pageSize),
		queryFn: () => getAuditLogs(page, pageSize),
		enabled: options.enabled,
	});
}

function useCreateCourseMutation() {
	return useMutation({
		mutationFn: createCourse,
	});
}

function useUpdateCourseMutation() {
	return useMutation({
		mutationFn: ({
			courseId,
			payload,
		}: {
			courseId: string;
			payload: Parameters<typeof updateCourse>[1];
		}) => updateCourse(courseId, payload),
	});
}

function usePublishCourseMutation() {
	return useMutation({
		mutationFn: publishCourse,
	});
}

function useUnpublishCourseMutation() {
	return useMutation({
		mutationFn: unpublishCourse,
	});
}

export {
	useAreasQuery,
	useAreaQuery,
	useCreateAreaMutation,
	useUpdateAreaMutation,
	useCoursesQuery,
	useAuditLogsQuery,
	useCreateCourseMutation,
	useUpdateCourseMutation,
	usePublishCourseMutation,
	useUnpublishCourseMutation,
};
