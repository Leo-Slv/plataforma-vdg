import { useMutation, useQueries, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';
import { getCourseCatalog } from '@/features/catalog/api/get-course-catalog';
import { getCourseDetails } from '@/features/catalog/api/get-course-details';
import { getCourseProgress } from '@/features/catalog/api/get-course-progress';
import { registerLessonProgress } from '@/features/catalog/api/register-lesson-progress';
import { getVideoPlayback } from '@/features/catalog/api/get-video-playback';

function useCourseCatalogQuery(options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.catalog.list,
		queryFn: getCourseCatalog,
		enabled: options.enabled,
	});
}

function useCourseDetailsQuery(
	courseId: string,
	options: { enabled: boolean },
) {
	return useQuery({
		queryKey: queryKeys.catalog.detail(courseId),
		queryFn: () => getCourseDetails(courseId),
		enabled: options.enabled && courseId.length > 0,
	});
}

function useCourseProgressQuery(
	courseId: string,
	options: { enabled: boolean },
) {
	return useQuery({
		queryKey: queryKeys.progress.course(courseId),
		queryFn: () => getCourseProgress(courseId),
		enabled: options.enabled && courseId.length > 0,
	});
}

function useRegisterLessonProgressMutation() {
	return useMutation({
		mutationFn: registerLessonProgress,
	});
}

function useVideoPlaybackQuery(videoId: string, options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.media.playback(videoId),
		queryFn: () => getVideoPlayback(videoId),
		enabled: options.enabled && videoId.length > 0,
		retry: false,
	});
}

function useOwnedCourseDetailsQueries(
	courseIds: string[],
	options: { enabled: boolean },
) {
	return useQueries({
		queries: courseIds.map((courseId) => ({
			queryKey: queryKeys.catalog.detail(courseId),
			queryFn: () => getCourseDetails(courseId),
			enabled: options.enabled,
		})),
	});
}

function useOwnedCourseProgressQueries(
	courseIds: string[],
	options: { enabled: boolean },
) {
	return useQueries({
		queries: courseIds.map((courseId) => ({
			queryKey: queryKeys.progress.course(courseId),
			queryFn: () => getCourseProgress(courseId),
			enabled: options.enabled,
		})),
	});
}

export {
	useCourseCatalogQuery,
	useCourseDetailsQuery,
	useCourseProgressQuery,
	useRegisterLessonProgressMutation,
	useOwnedCourseDetailsQueries,
	useOwnedCourseProgressQueries,
	useVideoPlaybackQuery,
};
