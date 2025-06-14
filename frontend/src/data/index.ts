import englishVocabularyQuestions from "./english_vocabulary_questions.json";
import geographyQuestions from "./geography_questions.json";
import scienceQuestions from "./science_questions.json";
import worldHistoryQuestions from "./world_history_questions.json";
import { Questions, User, Topic, Leaderboard } from "../model/user";

// Combine all questions
export const allQuestions: Questions[] = [
	...englishVocabularyQuestions,
	...geographyQuestions,
	...scienceQuestions,
	...worldHistoryQuestions,
];

// Dummy Topics
export const topics: Topic[] = [
	{ id: "english_vocabulary", name: "English Vocabulary" },
	{ id: "geography", name: "Geography" },
	{ id: "science", name: "Science" },
	{ id: "world_history", name: "World History" },
	{ id: "math", name: "Math Sprint" },
];

// Dummy Users
export const users: User[] = [
	{
		id: "user_001",
		email: "alice.wonder@example.com",
		name: "Alice Wonderland",
	},
	{ id: "user_002", email: "bob.builder@example.com", name: "Bob Builder" },
	{
		id: "user_003",
		email: "charlie.brown@example.com",
		name: "Charlie Brown",
	},
	{ id: "user_004", email: "diana.prince@example.com", name: "Diana Prince" },
];

// Dummy Leaderboard
export const leaderboard: Leaderboard[] = [
	// Science scores
	{
		id: "lb_001",
		userId: "user_001",
		topicId: "science",
		score: 95,
		duration: 180000,
	}, // 3 minutes
	{
		id: "lb_005",
		userId: "user_004",
		topicId: "science",
		score: 89,
		duration: 170000,
	}, // 2.83 minutes
	{
		id: "lb_007",
		userId: "user_002",
		topicId: "science",
		score: 87,
		duration: 195000,
	}, // 3.25 minutes
	{
		id: "lb_008",
		userId: "user_003",
		topicId: "science",
		score: 78,
		duration: 225000,
	}, // 3.75 minutes
	{
		id: "lb_009",
		userId: "user_001",
		topicId: "science",
		score: 72,
		duration: 280000,
	}, // 4.67 minutes

	// Geography scores
	{
		id: "lb_002",
		userId: "user_002",
		topicId: "geography",
		score: 88,
		duration: 210000,
	}, // 3.5 minutes
	{
		id: "lb_010",
		userId: "user_003",
		topicId: "geography",
		score: 91,
		duration: 165000,
	}, // 2.75 minutes
	{
		id: "lb_011",
		userId: "user_004",
		topicId: "geography",
		score: 84,
		duration: 185000,
	}, // 3.08 minutes
	{
		id: "lb_012",
		userId: "user_001",
		topicId: "geography",
		score: 79,
		duration: 245000,
	}, // 4.08 minutes
	{
		id: "lb_013",
		userId: "user_002",
		topicId: "geography",
		score: 76,
		duration: 220000,
	}, // 3.67 minutes

	// World History scores
	{
		id: "lb_003",
		userId: "user_001",
		topicId: "world_history",
		score: 92,
		duration: 195000,
	}, // 3.25 minutes
	{
		id: "lb_014",
		userId: "user_004",
		topicId: "world_history",
		score: 86,
		duration: 175000,
	}, // 2.92 minutes
	{
		id: "lb_015",
		userId: "user_003",
		topicId: "world_history",
		score: 83,
		duration: 205000,
	}, // 3.42 minutes
	{
		id: "lb_016",
		userId: "user_002",
		topicId: "world_history",
		score: 81,
		duration: 190000,
	}, // 3.17 minutes
	{
		id: "lb_017",
		userId: "user_001",
		topicId: "world_history",
		score: 74,
		duration: 260000,
	}, // 4.33 minutes

	// English Vocabulary scores
	{
		id: "lb_004",
		userId: "user_003",
		topicId: "english_vocabulary",
		score: 75,
		duration: 240000,
	}, // 4 minutes
	{
		id: "lb_006",
		userId: "user_002",
		topicId: "english_vocabulary",
		score: 82,
		duration: 220000,
	}, // 3.66 minutes
	{
		id: "lb_018",
		userId: "user_004",
		topicId: "english_vocabulary",
		score: 93,
		duration: 155000,
	}, // 2.58 minutes
	{
		id: "lb_019",
		userId: "user_001",
		topicId: "english_vocabulary",
		score: 88,
		duration: 180000,
	}, // 3 minutes
	{
		id: "lb_020",
		userId: "user_003",
		topicId: "english_vocabulary",
		score: 70,
		duration: 275000,
	}, // 4.58 minutes

	// Math Sprint scores
	{
		id: "lb_021",
		userId: "user_004",
		topicId: "math",
		score: 95,
		duration: 320000,
	}, // 5.33 minutes
	{
		id: "lb_022",
		userId: "user_001",
		topicId: "math",
		score: 90,
		duration: 285000,
	}, // 4.75 minutes
	{
		id: "lb_023",
		userId: "user_002",
		topicId: "math",
		score: 85,
		duration: 310000,
	}, // 5.17 minutes
	{
		id: "lb_024",
		userId: "user_003",
		topicId: "math",
		score: 80,
		duration: 345000,
	}, // 5.75 minutes
	{
		id: "lb_025",
		userId: "user_001",
		topicId: "math",
		score: 75,
		duration: 380000,
	}, // 6.33 minutes
];

// Export all data
export default {
	allQuestions,
	topics,
	users,
	leaderboard,
};

// Leaderboard management functions
const currentLeaderboard = [...leaderboard];

// Fake current user (for now, we'll use the first user)
export const getCurrentUser = (): User => users[0]; // Alice Wonderland

// Function to add a new leaderboard entry
export const addLeaderboardEntry = (
	entry: Omit<Leaderboard, "id">
): Leaderboard => {
	const newEntry: Leaderboard = {
		...entry,
		id: `lb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
	};
	currentLeaderboard.push(newEntry);
	return newEntry;
};

// Function to get current leaderboard
export const getLeaderboard = (): Leaderboard[] => [...currentLeaderboard];

// Function to get leaderboard for a specific topic
export const getLeaderboardByTopic = (topicId: string): Leaderboard[] => {
	return currentLeaderboard
		.filter((entry) => entry.topicId === topicId)
		.sort((a, b) => {
			// Sort by score descending, then by duration ascending (faster is better)
			if (a.score !== b.score) return b.score - a.score;
			return a.duration - b.duration;
		});
};

// Function to get user's best score for a topic
export const getUserBestScore = (
	userId: string,
	topicId: string
): Leaderboard | null => {
	const userEntries = currentLeaderboard
		.filter((entry) => entry.userId === userId && entry.topicId === topicId)
		.sort((a, b) => {
			if (a.score !== b.score) return b.score - a.score;
			return a.duration - b.duration;
		});
	return userEntries[0] || null;
};
