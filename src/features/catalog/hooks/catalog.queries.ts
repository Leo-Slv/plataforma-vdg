import { useMutation, useQueries, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';
import { getCourseCatalog } from '@/features/catalog/api/get-course-catalog';
import { getCourseDetails } from '@/features/catalog/api/get-course-details';
import { getCourseProgress } from '@/features/catalog/api/get-course-progress';
import { registerLessonProgress } from '@/features/catalog/api/register-lesson-progress';
import { getVideoPlayback } from '@/features/catalog/api/get-video-playback';
import { getLessonNote } from '@/features/catalog/api/get-lesson-note';
import { saveLessonNote } from '@/features/catalog/api/save-lesson-note';
import { removeLessonNote } from '@/features/catalog/api/remove-lesson-note';
import { getLessonQuestions } from '@/features/catalog/api/get-lesson-questions';
import { askLessonQuestion } from '@/features/catalog/api/ask-lesson-question';

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

function useLessonNoteQuery(lessonId: string, options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.lessons.note(lessonId),
		queryFn: () => getLessonNote(lessonId),
		enabled: options.enabled && lessonId.length > 0,
		retry: false,
	});
}

function useSaveLessonNoteMutation() {
	return useMutation({
		mutationFn: saveLessonNote,
	});
}

function useRemoveLessonNoteMutation() {
	return useMutation({
		mutationFn: removeLessonNote,
	});
}

function useLessonQuestionsQuery(
	lessonId: string,
	options: { enabled: boolean },
) {
	return useQuery({
		queryKey: queryKeys.lessons.questions(lessonId),
		queryFn: () => getLessonQuestions(lessonId),
		enabled: options.enabled && lessonId.length > 0,
	});
}

function useAskLessonQuestionMutation() {
	return useMutation({
		mutationFn: askLessonQuestion,
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
	useLessonNoteQuery,
	useSaveLessonNoteMutation,
	useRemoveLessonNoteMutation,
	useLessonQuestionsQuery,
	useAskLessonQuestionMutation,
};
