type LessonProgress = {
	lessonId: string;
	completed: boolean;
	watchedSeconds: number;
	lastPositionSeconds: number;
	lastWatchedAt: string;
};

type CourseProgress = {
	progressPercent: number;
	lessons: LessonProgress[];
};

export type { LessonProgress, CourseProgress };
