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
import { getCourseModules } from '@/features/admin/api/get-course-modules';
import { createCourseModule } from '@/features/admin/api/create-course-module';
import { updateCourseModule } from '@/features/admin/api/update-course-module';
import { deleteCourseModule } from '@/features/admin/api/delete-course-module';
import { reorderCourseModules } from '@/features/admin/api/reorder-course-modules';
import { createLesson } from '@/features/admin/api/create-lesson';
import { updateLesson } from '@/features/admin/api/update-lesson';
import { deleteLesson } from '@/features/admin/api/delete-lesson';
import { reorderLessons } from '@/features/admin/api/reorder-lessons';
import { getLessonVideo } from '@/features/admin/api/get-lesson-video';
import { replaceLessonVideo } from '@/features/admin/api/replace-lesson-video';
import { markVideoReady } from '@/features/admin/api/mark-video-ready';
import { deleteLessonVideo } from '@/features/admin/api/delete-lesson-video';
import { getUsers } from '@/features/admin/api/get-users';
import { createUser } from '@/features/admin/api/create-user';
import { getUserAreaAccess } from '@/features/admin/api/get-user-area-access';
import { getUser } from '@/features/admin/api/get-user';
import { updateUser } from '@/features/admin/api/update-user';
import { grantUserAreaAccess } from '@/features/admin/api/grant-user-area-access';
import { revokeUserAreaAccess } from '@/features/admin/api/revoke-user-area-access';
import { getGrantedCourseAccess } from '@/features/admin/api/get-granted-course-access';
import { grantCourseAccess } from '@/features/admin/api/grant-course-access';

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

function useCourseModulesQuery(
	courseId: string,
	options: { enabled: boolean },
) {
	return useQuery({
		queryKey: queryKeys.admin.courseModules(courseId),
		queryFn: () => getCourseModules(courseId),
		enabled: options.enabled && courseId.length > 0,
	});
}

function useCreateCourseModuleMutation() {
	return useMutation({
		mutationFn: ({
			courseId,
			payload,
		}: {
			courseId: string;
			payload: Parameters<typeof createCourseModule>[1];
		}) => createCourseModule(courseId, payload),
	});
}

function useUpdateCourseModuleMutation() {
	return useMutation({
		mutationFn: ({
			courseId,
			moduleId,
			payload,
		}: {
			courseId: string;
			moduleId: string;
			payload: Parameters<typeof updateCourseModule>[2];
		}) => updateCourseModule(courseId, moduleId, payload),
	});
}

function useDeleteCourseModuleMutation() {
	return useMutation({
		mutationFn: ({
			courseId,
			moduleId,
		}: {
			courseId: string;
			moduleId: string;
		}) => deleteCourseModule(courseId, moduleId),
	});
}

function useReorderCourseModulesMutation() {
	return useMutation({
		mutationFn: ({
			courseId,
			moduleIds,
		}: {
			courseId: string;
			moduleIds: string[];
		}) => reorderCourseModules(courseId, moduleIds),
	});
}

function useCreateLessonMutation() {
	return useMutation({
		mutationFn: ({
			courseId,
			moduleId,
			payload,
		}: {
			courseId: string;
			moduleId: string;
			payload: Parameters<typeof createLesson>[2];
		}) => createLesson(courseId, moduleId, payload),
	});
}

function useUpdateLessonMutation() {
	return useMutation({
		mutationFn: ({
			courseId,
			moduleId,
			lessonId,
			payload,
		}: {
			courseId: string;
			moduleId: string;
			lessonId: string;
			payload: Parameters<typeof updateLesson>[3];
		}) => updateLesson(courseId, moduleId, lessonId, payload),
	});
}

function useDeleteLessonMutation() {
	return useMutation({
		mutationFn: ({
			courseId,
			moduleId,
			lessonId,
		}: {
			courseId: string;
			moduleId: string;
			lessonId: string;
		}) => deleteLesson(courseId, moduleId, lessonId),
	});
}

function useReorderLessonsMutation() {
	return useMutation({
		mutationFn: ({
			courseId,
			moduleId,
			lessonIds,
		}: {
			courseId: string;
			moduleId: string;
			lessonIds: string[];
		}) => reorderLessons(courseId, moduleId, lessonIds),
	});
}

function useLessonVideoQuery(lessonId: string, options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.admin.lessonVideo(lessonId),
		queryFn: () => getLessonVideo(lessonId),
		enabled: options.enabled && lessonId.length > 0,
		retry: false,
	});
}

function useReplaceLessonVideoMutation() {
	return useMutation({
		mutationFn: ({
			lessonId,
			payload,
		}: {
			lessonId: string;
			payload: Parameters<typeof replaceLessonVideo>[1];
		}) => replaceLessonVideo(lessonId, payload),
	});
}

function useMarkVideoReadyMutation() {
	return useMutation({
		mutationFn: ({ videoId }: { videoId: string }) => markVideoReady(videoId),
	});
}

function useDeleteLessonVideoMutation() {
	return useMutation({
		mutationFn: ({ lessonId }: { lessonId: string }) =>
			deleteLessonVideo(lessonId),
	});
}

function useUsersQuery(
	page: number,
	pageSize: number,
	search: string,
	options: { enabled: boolean },
) {
	return useQuery({
		queryKey: queryKeys.admin.users(page, pageSize, search),
		queryFn: () => getUsers(page, pageSize, search),
		enabled: options.enabled,
	});
}

function useCreateUserMutation() {
	return useMutation({
		mutationFn: createUser,
	});
}

function useUserAreaAccessQuery(userId: string, options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.admin.userAreaAccess(userId),
		queryFn: () => getUserAreaAccess(userId),
		enabled: options.enabled && userId.length > 0,
	});
}

function useUserQuery(userId: string, options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.admin.user(userId),
		queryFn: () => getUser(userId),
		enabled: options.enabled && userId.length > 0,
		retry: false,
	});
}

function useUpdateUserMutation() {
	return useMutation({
		mutationFn: ({
			userId,
			payload,
		}: {
			userId: string;
			payload: Parameters<typeof updateUser>[1];
		}) => updateUser(userId, payload),
	});
}

function useGrantUserAreaAccessMutation() {
	return useMutation({
		mutationFn: ({ userId, areaId }: { userId: string; areaId: string }) =>
			grantUserAreaAccess(userId, areaId),
	});
}

function useRevokeUserAreaAccessMutation() {
	return useMutation({
		mutationFn: ({ userId, areaId }: { userId: string; areaId: string }) =>
			revokeUserAreaAccess(userId, areaId),
	});
}

function useGrantedCourseAccessQuery(
	userId: string,
	options: { enabled: boolean },
) {
	return useQuery({
		queryKey: queryKeys.admin.grantedCourseAccess(userId),
		queryFn: () => getGrantedCourseAccess(userId),
		enabled: options.enabled && userId.length > 0,
	});
}

function useGrantCourseAccessMutation() {
	return useMutation({
		mutationFn: ({ userId, courseId }: { userId: string; courseId: string }) =>
			grantCourseAccess(userId, courseId),
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
	useCourseModulesQuery,
	useCreateCourseModuleMutation,
	useUpdateCourseModuleMutation,
	useDeleteCourseModuleMutation,
	useReorderCourseModulesMutation,
	useCreateLessonMutation,
	useUpdateLessonMutation,
	useDeleteLessonMutation,
	useReorderLessonsMutation,
	useLessonVideoQuery,
	useReplaceLessonVideoMutation,
	useMarkVideoReadyMutation,
	useDeleteLessonVideoMutation,
	useUsersQuery,
	useCreateUserMutation,
	useUserAreaAccessQuery,
	useUserQuery,
	useUpdateUserMutation,
	useGrantUserAreaAccessMutation,
	useRevokeUserAreaAccessMutation,
	useGrantedCourseAccessQuery,
	useGrantCourseAccessMutation,
};
