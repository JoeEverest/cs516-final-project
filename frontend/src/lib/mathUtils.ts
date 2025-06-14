import { MathQuestion } from "../model/user";

export type MathOperation =
	| "addition"
	| "subtraction"
	| "multiplication"
	| "division";

// Generate a random integer between min and max (inclusive)
const randomInt = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate addition questions (max 3 digit result)
const generateAddition = (): {
	left: number;
	right: number;
	answer: number;
} => {
	// To ensure max 3 digit result (999), we need to be careful with our ranges
	const left = randomInt(1, 500);
	const maxRight = Math.min(999 - left, 500);
	const right = randomInt(1, maxRight);
	const answer = left + right;

	return { left, right, answer };
};

// Generate subtraction questions (result always >= 0)
const generateSubtraction = (): {
	left: number;
	right: number;
	answer: number;
} => {
	// Generate result first to ensure it's positive
	const answer = randomInt(0, 999);
	const addend = randomInt(1, 999 - answer);
	const left = answer + addend;
	const right = addend;

	return { left, right, answer };
};

// Generate multiplication questions (max 3 digit total)
const generateMultiplication = (): {
	left: number;
	right: number;
	answer: number;
} => {
	// To keep result under 1000, we'll use smaller factors
	const left = randomInt(2, 31); // 31 * 31 = 961 (still under 1000)
	const maxRight = Math.floor(999 / left);
	const right = randomInt(2, maxRight);
	const answer = left * right;

	return { left, right, answer };
};

// Generate division questions (result is always a whole number > 0)
const generateDivision = (): {
	left: number;
	right: number;
	answer: number;
} => {
	// Generate answer first, then multiply to get dividend
	const answer = randomInt(2, 99); // Keep quotient reasonable
	const right = randomInt(2, 20); // Keep divisor reasonable
	const left = answer * right;

	return { left, right, answer };
};

// Generate a single math question
export const generateMathQuestion = (
	operation: MathOperation,
	id: string
): MathQuestion => {
	let left: number, right: number, answer: number;

	switch (operation) {
		case "addition":
			({ left, right, answer } = generateAddition());
			break;
		case "subtraction":
			({ left, right, answer } = generateSubtraction());
			break;
		case "multiplication":
			({ left, right, answer } = generateMultiplication());
			break;
		case "division":
			({ left, right, answer } = generateDivision());
			break;
	}

	const operatorSymbol = {
		addition: "+",
		subtraction: "-",
		multiplication: "×",
		division: "÷",
	}[operation];

	return {
		id,
		left,
		right,
		action: operation,
		answer,
		questionText: `${left} ${operatorSymbol} ${right} = ?`,
	};
};

// Generate a full set of 20 math questions (5 of each type)
export const generateMathQuizSession = (): MathQuestion[] => {
	const questions: MathQuestion[] = [];
	const operations: MathOperation[] = [
		"addition",
		"subtraction",
		"multiplication",
		"division",
	];

	// Generate 5 questions of each type
	operations.forEach((operation) => {
		for (let i = 0; i < 5; i++) {
			const id = `math_${operation}_${i + 1}`;
			questions.push(generateMathQuestion(operation, id));
		}
	});

	// Shuffle the questions
	for (let i = questions.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[questions[i], questions[j]] = [questions[j], questions[i]];
	}

	return questions;
};

// Get the number of digits in the answer (for OTP-style input)
export const getAnswerDigitCount = (answer: number): number => {
	return answer.toString().length;
};
