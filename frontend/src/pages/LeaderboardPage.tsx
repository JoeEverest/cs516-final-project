import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Trophy, Medal, Award, Clock } from 'lucide-react';
import { users } from '../data';
import { User } from '../model/user';
import { useLeaderboard, useTopics } from '../api/queries';

const LeaderboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedTopicId, setSelectedTopicId] = useState<string>('all');

    // Use React Query hooks for data fetching
    const { data: topics = [], isLoading: topicsLoading } = useTopics();
    const { data: leaderboardData = [], isLoading: leaderboardLoading } = useLeaderboard(
        selectedTopicId === 'all' ? undefined : selectedTopicId
    );

    const isLoading = topicsLoading || leaderboardLoading;

    // Sort leaderboard data: by score descending, then by duration ascending (faster is better)
    const filteredLeaderboard = [...leaderboardData].sort((a, b) => {
        if (a.score !== b.score) {
            return b.score - a.score;
        }
        return (a.duration || 0) - (b.duration || 0);
    });

    const getUserName = (userId: string): string => {
        const user = users.find((u: User) => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    const getTopicName = (topicId: string): string => {
        const topic = topics.find((t) => t.id === topicId);
        return topic ? topic.name : 'Unknown Topic';
    };

    const formatDuration = (duration: number): string => {
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-8 h-8 text-yellow-500" />;
            case 2:
                return <Medal className="w-8 h-8 text-gray-400" />;
            case 3:
                return <Award className="w-8 h-8 text-amber-600" />;
            default:
                return <span className="w-8 h-8 flex items-center justify-center text-white font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-500 rounded-full">{rank}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col justify-center w-full items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300 font-bold rounded-full px-6 py-3 transition-all duration-200 hover:scale-105"
                    >
                        🏠 Back to Home
                    </Button>
                    <h1 className="text-4xl font-bold text-purple-700">🏆 Hall of Fame 🏆</h1>
                </div>
            </div>

            {/* Topic Filter */}
            <Card className="border-4 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                        🎯 Filter by Topic
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedTopicId === 'all' ? 'default' : 'outline'}
                            onClick={() => setSelectedTopicId('all')}
                            size="sm"
                            disabled={topicsLoading}
                            className={`font-bold rounded-full transition-all duration-200 hover:scale-105 ${selectedTopicId === 'all'
                                ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
                                : 'bg-white border-purple-300 text-purple-600 hover:bg-purple-50'
                                }`}
                        >
                            🌟 All Topics
                        </Button>
                        {topicsLoading ? (
                            <div className="flex items-center gap-2 text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                <span className="text-sm">Loading topics...</span>
                            </div>
                        ) : (
                            topics.map((topic) => (
                                <Button
                                    key={topic.id}
                                    variant={selectedTopicId === topic.id ? 'default' : 'outline'}
                                    onClick={() => setSelectedTopicId(topic.id)}
                                    size="sm"
                                    className={`font-bold rounded-full transition-all duration-200 hover:scale-105 ${selectedTopicId === topic.id
                                        ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
                                        : 'bg-white border-purple-300 text-purple-600 hover:bg-purple-50'
                                        }`}
                                >
                                    {topic.name === 'English Vocabulary' && '📚'}
                                    {topic.name === 'Geography' && '🌍'}
                                    {topic.name === 'Science' && '🔬'}
                                    {topic.name === 'World History' && '📜'}
                                    {topic.name}
                                </Button>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="border-4 border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardHeader>
                    <CardTitle className="text-blue-700 text-2xl font-bold">
                        🏅 {selectedTopicId === 'all'
                            ? 'Overall Champions'
                            : `${getTopicName(selectedTopicId)} Champions`
                        } 🏅
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="flex items-center justify-center gap-2 text-gray-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span>Loading leaderboard...</span>
                            </div>
                        </div>
                    ) : filteredLeaderboard.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No scores available for this topic yet.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredLeaderboard.map((entry, index) => {
                                const rank = index + 1;
                                const isTopThree = rank <= 3;

                                return (
                                    <div
                                        key={entry.id}
                                        className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${isTopThree
                                            ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0">
                                                {getRankIcon(rank)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-800">
                                                    {getUserName(entry.userId)}
                                                </div>
                                                {selectedTopicId === 'all' && (
                                                    <div className="text-sm text-gray-600">
                                                        {getTopicName(entry.topicId)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-right">
                                            <div>
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {entry.score}%
                                                </div>
                                                <div className="text-xs text-gray-500">Score</div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <div className="font-medium text-gray-700">
                                                        {formatDuration(entry.duration || 0)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Time</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex justify-center">
                <Button
                    onClick={() => navigate('/')}
                    size="lg"
                    className="px-8"
                >
                    Take a Quiz
                </Button>
            </div>
        </div>
    );
};

export default LeaderboardPage;
