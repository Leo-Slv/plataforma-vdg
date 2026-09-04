type LessonProgress = {
	lessonId: string;
	completed: boolean;
	lastWatchedAt: string;
};

type CourseProgress = {
	progressPercent: number;
	lessons: LessonProgress[];
};

export type { LessonProgress, CourseProgress };
