import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Trophy, Clock, Target, RotateCcw, Home, Save } from 'lucide-react';
import { MathQuizResult } from './MathQuiz';
import { useCreateLeaderboardEntry } from '../api/queries';

interface MathScoreDisplayProps {
    result: MathQuizResult;
    onRestart: () => void;
}

const MathScoreDisplay: React.FC<MathScoreDisplayProps> = ({ result, onRestart }) => {
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);
    const createLeaderboardEntry = useCreateLeaderboardEntry();

    // Helper function to decode JWT and extract user info
    const getUserFromToken = () => {
        try {
            const authData = localStorage.getItem("auth");
            if (!authData) return null;

            const { idToken } = JSON.parse(authData);
            if (!idToken) return null;

            // Decode JWT token (split and decode base64)
            const payload = idToken.split('.')[1];
            const decodedPayload = JSON.parse(atob(payload));

            return {
                userId: decodedPayload.sub,
                username: decodedPayload['cognito:username'],
                email: decodedPayload.email
            };
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'from-green-400 to-green-600';
        if (score >= 80) return 'from-blue-400 to-blue-600';
        if (score >= 70) return 'from-yellow-400 to-yellow-600';
        if (score >= 60) return 'from-orange-400 to-orange-600';
        return 'from-red-400 to-red-600';
    };

    const getScoreEmoji = (score: number) => {
        if (score >= 90) return '🏆';
        if (score >= 80) return '🌟';
        if (score >= 70) return '🎯';
        if (score >= 60) return '👍';
        return '💪';
    };

    const getEncouragementMessage = (score: number) => {
        if (score >= 90) return 'Amazing! You\'re a Math Champion! 🏆';
        if (score >= 80) return 'Excellent work! Keep it up! 🌟';
        if (score >= 70) return 'Great job! You\'re getting better! 🎯';
        if (score >= 60) return 'Good effort! Practice makes perfect! 👍';
        return 'Keep trying! You can do it! 💪';
    };

    const handleSaveToLeaderboard = async () => {
        if (isSaved || createLeaderboardEntry.isLoading) return;

        const user = getUserFromToken();
        if (!user) {
            console.error('No user found in token');
            return;
        }

        try {
            await createLeaderboardEntry.mutateAsync({
                userId: user.userId,
                username: user.username,
                topicId: 'math',
                score: result.score,
                totalQuestions: result.totalQuestions,
                duration: result.duration
            });

            setIsSaved(true);
        } catch (error) {
            console.error('Failed to save to leaderboard:', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border-4 border-purple-200 shadow-xl">
                {/* Trophy Section */}
                <div className="text-center mb-8">
                    <div className={`inline-block p-6 rounded-full bg-gradient-to-r ${getScoreColor(result.score)} mb-4 shadow-lg`}>
                        <Trophy className="w-16 h-16 text-white" />
                    </div>

                    <h2 className="text-4xl font-bold text-gray-800 mb-2">
                        Math Sprint Complete! {getScoreEmoji(result.score)}
                    </h2>

                    <p className="text-xl text-gray-600 mb-6">
                        {getEncouragementMessage(result.score)}
                    </p>
                </div>

                {/* Score Display */}
                <div className={`bg-gradient-to-r ${getScoreColor(result.score)} rounded-2xl p-6 text-white text-center mb-8 shadow-lg`}>
                    <div className="text-6xl font-bold mb-2">{result.score}%</div>
                    <div className="text-xl font-semibold">Your Score</div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 text-center border-2 border-green-300">
                        <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-green-800 mb-1">{result.correctAnswers}</div>
                        <div className="text-green-700 font-semibold">Correct</div>
                    </div>

                    <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-2xl p-6 text-center border-2 border-red-300">
                        <div className="text-3xl font-bold text-red-800 mb-1">{result.incorrectAnswers}</div>
                        <div className="text-red-700 font-semibold">Incorrect</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 text-center border-2 border-blue-300 col-span-2">
                        <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-blue-800 mb-1">{formatTime(result.duration)}</div>
                        <div className="text-blue-700 font-semibold">Time Taken</div>
                    </div>
                </div>

                {/* Operation Breakdown */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Operation Breakdown</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {['addition', 'subtraction', 'multiplication', 'division'].map(operation => {
                            const operationQuestions = result.questions.filter(q => q.action === operation);
                            const correctCount = operationQuestions.filter((q) => {
                                const questionIndex = result.questions.findIndex(rq => rq.id === q.id);
                                return result.userAnswers[questionIndex] === q.answer;
                            }).length;

                            const operationEmoji = {
                                addition: '➕',
                                subtraction: '➖',
                                multiplication: '✖️',
                                division: '➗'
                            }[operation];

                            return (
                                <div key={operation} className="bg-gray-50 rounded-xl p-4 text-center border-2 border-gray-200">
                                    <div className="text-2xl mb-1">{operationEmoji}</div>
                                    <div className="font-bold text-gray-800">{correctCount}/5</div>
                                    <div className="text-sm text-gray-600 capitalize">{operation}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4">
                    {!isSaved && (
                        <Button
                            onClick={handleSaveToLeaderboard}
                            disabled={createLeaderboardEntry.isLoading}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white py-4 text-lg font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                        >
                            <Save className="w-5 h-5" />
                            {createLeaderboardEntry.isLoading ? 'Saving...' : 'Save to Leaderboard'}
                        </Button>
                    )}

                    {isSaved && (
                        <div className="bg-green-100 border-2 border-green-300 rounded-2xl p-4 text-center text-green-800 font-bold">
                            ✅ Saved to Leaderboard!
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button
                            onClick={onRestart}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white py-4 text-lg font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Try Again
                        </Button>

                        <Button
                            onClick={() => navigate('/')}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white py-4 text-lg font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                        >
                            <Home className="w-5 h-5" />
                            Home
                        </Button>
                    </div>

                    <Button
                        onClick={() => navigate('/leaderboard')}
                        variant="outline"
                        className="flex items-center justify-center gap-2 border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 py-4 text-lg font-bold rounded-2xl shadow-lg"
                    >
                        <Trophy className="w-5 h-5" />
                        View Leaderboard
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MathScoreDisplay;
