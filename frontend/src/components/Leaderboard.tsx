import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrophyIcon, ClockIcon, UserIcon, ArrowLeftIcon } from 'lucide-react';
import { getLeaderboard, getLeaderboardByTopic, topics, users } from '@/data';

interface LeaderboardProps {
    onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    const allLeaderboard = getLeaderboard();
    const topicLeaderboard = selectedTopic ? getLeaderboardByTopic(selectedTopic) : allLeaderboard;

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getUserName = (userId: string) => {
        const user = users.find(u => u.id === userId);
        return user?.name || 'Unknown User';
    };

    const getTopicName = (topicId: string) => {
        const topic = topics.find(t => t.id === topicId);
        return topic?.name || 'Unknown Topic';
    };

    const getRankColor = (index: number) => {
        if (index === 0) return 'text-yellow-600'; // Gold
        if (index === 1) return 'text-gray-500'; // Silver
        if (index === 2) return 'text-amber-600'; // Bronze
        return 'text-gray-700';
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `#${index + 1}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <TrophyIcon className="w-8 h-8 text-yellow-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
                </div>
                <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back
                </Button>
            </div>

            {/* Topic Filter */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => setSelectedTopic(null)}
                        variant={selectedTopic === null ? "default" : "outline"}
                        size="sm"
                    >
                        All Topics
                    </Button>
                    {topics.map((topic) => (
                        <Button
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic.id)}
                            variant={selectedTopic === topic.id ? "default" : "outline"}
                            size="sm"
                        >
                            {topic.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Leaderboard Entries */}
            <div className="space-y-3">
                {topicLeaderboard.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <TrophyIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>No scores yet for this topic.</p>
                        <p className="text-sm">Be the first to take a quiz!</p>
                    </div>
                ) : (
                    topicLeaderboard.map((entry, index) => (
                        <Card key={entry.id} className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {/* Rank */}
                                    <div className={`text-2xl font-bold ${getRankColor(index)} min-w-[3rem]`}>
                                        {getRankIcon(index)}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex items-center gap-3">
                                        <UserIcon className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <div className="font-semibold text-gray-800">
                                                {getUserName(entry.userId)}
                                            </div>
                                            {!selectedTopic && (
                                                <div className="text-sm text-gray-500">
                                                    {getTopicName(entry.topicId)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Score and Time */}
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600">
                                            {entry.score}%
                                        </div>
                                        <div className="text-sm text-gray-500">Score</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-yellow-600">
                                            <ClockIcon className="w-4 h-4" />
                                            <span className="font-semibold">
                                                {formatTime(entry.duration)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">Time</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Statistics */}
            {topicLeaderboard.length > 0 && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3">Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-600">
                                {topicLeaderboard.length}
                            </div>
                            <div className="text-sm text-gray-600">Total Scores</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">
                                {Math.round(topicLeaderboard.reduce((sum, entry) => sum + entry.score, 0) / topicLeaderboard.length)}%
                            </div>
                            <div className="text-sm text-gray-600">Avg Score</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {Math.max(...topicLeaderboard.map(entry => entry.score))}%
                            </div>
                            <div className="text-sm text-gray-600">Best Score</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-600">
                                {formatTime(Math.min(...topicLeaderboard.map(entry => entry.duration)))}
                            </div>
                            <div className="text-sm text-gray-600">Best Time</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
