export type User = {
	id: string;
	email: string;
	name: string;
};

export type Topic = {
	id: string;
	name: string;
};

export type Questions = {
	id: string;
	topicId: string;
	question: string;
	answer: string[];
	correctAnswer: string;
};

export type Leaderboard = {
	id: string;
	userId: string;
	topicId: string;
	score: number;
	duration: number;
};

export type MathQuestion = {
	id: string;
	left: number;
	right: number;
	action: "addition" | "subtraction" | "multiplication" | "division";
	answer: number;
	questionText: string;
};

export type MathQuizSession = {
	questions: MathQuestion[];
	currentQuestionIndex: number;
	userAnswers: (number | null)[];
	startTime: number;
};
