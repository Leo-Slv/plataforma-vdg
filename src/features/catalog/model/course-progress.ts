type LessonProgress = {
	lessonId: string;
	completed: boolean;
};

type CourseProgress = {
	progressPercent: number;
	lessons: LessonProgress[];
};

export type { LessonProgress, CourseProgress };
