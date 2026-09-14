type LessonQuestion = {
	id: string;
	askedByName: string;
	questionText: string;
	answerText: string | null;
	answeredByName: string | null;
	createdAt: string;
};

export type { LessonQuestion };
