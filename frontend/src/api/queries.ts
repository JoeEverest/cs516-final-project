import { useQuery, useMutation, useQueryClient } from "react-query";
import { apiClient } from "./client";

// Types
export interface Topic {
	id: string;
	name: string;
	description?: string;
	difficulty?: string;
}

export interface Question {
	id: string;
	topicId: string;
	question: string;
	answer: string[];
	correctAnswer: string;
}

export interface LeaderboardEntry {
	id: string;
	userId: string;
	username?: string;
	topicId: string;
	score: number;
	totalQuestions?: number;
	duration?: number;
	createdAt: string;
}

export interface CreateLeaderboardEntry {
	userId: string;
	username: string;
	topicId: string;
	score: number;
	totalQuestions: number;
	duration?: number;
}

// API Functions
const topicsApi = {
	getAll: async (): Promise<Topic[]> => {
		const { data } = await apiClient.get("/topics");
		return data.topics;
	},

	getQuestions: async (topicId: string): Promise<Question[]> => {
		const response = await apiClient.get(`/questions/${topicId}`);
		return response.data;
	},

	create: async (topic: Omit<Topic, "id">): Promise<Topic> => {
		const response = await apiClient.post("/topics", topic);
		return response.data;
	},
};

const leaderboardApi = {
	getAll: async (topicId?: string): Promise<LeaderboardEntry[]> => {
		const url = topicId
			? `/leaderboard?topicId=${topicId}`
			: "/leaderboard";
		const { data } = await apiClient.get(url);
		return data.entries;
	},

	create: async (
		entry: CreateLeaderboardEntry
	): Promise<LeaderboardEntry> => {
		const response = await apiClient.post("/leaderboard", entry);
		return response.data;
	},
};

// Query Keys
export const queryKeys = {
	topics: ["topics"] as const,
	questions: (topicId: string) => ["questions", topicId] as const,
	leaderboard: ["leaderboard"] as const,
	leaderboardByTopic: (topicId: string) => ["leaderboard", topicId] as const,
};

// React Query Hooks
export const useTopics = () => {
	return useQuery({
		queryKey: queryKeys.topics,
		queryFn: topicsApi.getAll,
		staleTime: 5 * 60 * 1000, // 5 minutes
		cacheTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useQuestions = (topicId: string) => {
	return useQuery({
		queryKey: queryKeys.questions(topicId),
		queryFn: () => topicsApi.getQuestions(topicId),
		enabled: !!topicId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		cacheTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useLeaderboard = (topicId?: string) => {
	return useQuery({
		queryKey: topicId
			? queryKeys.leaderboardByTopic(topicId)
			: queryKeys.leaderboard,
		queryFn: () => leaderboardApi.getAll(topicId),
		staleTime: 30 * 1000, // 30 seconds
		cacheTime: 2 * 60 * 1000, // 2 minutes
	});
};

export const useCreateTopic = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: topicsApi.create,
		onSuccess: () => {
			// Invalidate and refetch topics
			queryClient.invalidateQueries(queryKeys.topics);
		},
	});
};

export const useCreateLeaderboardEntry = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: leaderboardApi.create,
		onSuccess: (data) => {
			// Invalidate all leaderboard queries
			queryClient.invalidateQueries(queryKeys.leaderboard);
			// Also invalidate topic-specific leaderboard
			queryClient.invalidateQueries(
				queryKeys.leaderboardByTopic(data.topicId)
			);
		},
	});
};
