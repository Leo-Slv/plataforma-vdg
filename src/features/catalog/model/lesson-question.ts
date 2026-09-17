type LessonQuestion = {
	id: string;
	askedByName: string;
	askedByAvatarUrl: string | null;
	questionText: string;
	answerText: string | null;
	answeredByName: string | null;
	answeredByAvatarUrl: string | null;
	createdAt: string;
};

export type { LessonQuestion };
