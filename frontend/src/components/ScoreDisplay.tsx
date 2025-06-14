import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { QuizResult } from './QuizApp';
import { TrophyIcon, ClockIcon, CheckCircleIcon, XCircleIcon, RotateCcwIcon, PlusIcon, SaveIcon } from 'lucide-react';
import { addLeaderboardEntry, getCurrentUser } from '@/data';

interface ScoreDisplayProps {
    result: QuizResult;
    onRestart: () => void;
    onNewQuiz: () => void;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ result, onRestart, onNewQuiz }) => {
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreMessage = (score: number) => {
        if (score >= 90) return 'WOW! You\'re a superstar! 🌟';
        if (score >= 80) return 'Awesome job! You\'re amazing! 🤩';
        if (score >= 70) return 'Great work! Keep being awesome! 😊';
        if (score >= 60) return 'Good effort! You\'re getting there! 💪';
        return 'Nice try! Practice makes perfect! 🎯';
    };

    const getScoreEmoji = (score: number) => {
        if (score >= 90) return '🏆🎉🌟';
        if (score >= 80) return '🎉👏⭐';
        if (score >= 70) return '👍😊✨';
        if (score >= 60) return '🙂💪📈';
        return '📚🎯💡';
    };

    const handleSaveToLeaderboard = async () => {
        if (isSaved) return;

        setSaving(true);
        try {
            const currentUser = getCurrentUser();
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

            addLeaderboardEntry({
                userId: currentUser.id,
                topicId: result.topicId,
                score: result.score,
                duration: result.duration
            });

            setIsSaved(true);
        } catch (error) {
            console.error('Failed to save to leaderboard:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border-4 border-yellow-400 relative overflow-hidden">
            {/* Confetti Background Effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 text-2xl animate-bounce">🎉</div>
                <div className="absolute top-8 right-6 text-2xl animate-pulse">⭐</div>
                <div className="absolute bottom-6 left-8 text-2xl animate-ping">✨</div>
                <div className="absolute bottom-4 right-4 text-2xl animate-bounce">🎊</div>
            </div>

            {/* Trophy Icon */}
            <div className="flex justify-center mb-6 relative z-10">
                <div className={`p-6 rounded-full ${result.score >= 70 ? 'bg-gradient-to-r from-yellow-200 to-yellow-400' : 'bg-gray-100'} animate-pulse`}>
                    <TrophyIcon className={`w-16 h-16 ${result.score >= 70 ? 'text-yellow-700' : 'text-gray-600'}`} />
                </div>
            </div>

            {/* Title */}
            <h2 className="text-4xl font-bold text-purple-700 mb-2">🎯 Quiz Complete! 🎯</h2>
            <p className="text-purple-600 mb-8 text-xl font-bold">{result.topicName} Challenge</p>

            {/* Score */}
            <div className="mb-8 relative z-10">
                <div className={`text-8xl font-bold mb-4 ${getScoreColor(result.score)} drop-shadow-lg animate-pulse`}>
                    {result.score}%
                </div>
                <p className="text-2xl text-gray-700 mb-4 font-bold bg-yellow-100 p-4 rounded-2xl border-2 border-yellow-300">
                    {getScoreMessage(result.score)}
                </p>
                <div className="text-4xl mb-4">
                    {getScoreEmoji(result.score)}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
                <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-2xl p-4 border-2 border-green-300">
                    <div className="flex items-center justify-center mb-2">
                        <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-green-600">{result.correctAnswers}</div>
                    <div className="text-sm font-bold text-green-700">✅ Correct</div>
                </div>

                <div className="bg-gradient-to-r from-red-100 to-red-200 rounded-2xl p-4 border-2 border-red-300">
                    <div className="flex items-center justify-center mb-2">
                        <XCircleIcon className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="text-3xl font-bold text-red-600">{result.incorrectAnswers}</div>
                    <div className="text-sm font-bold text-red-700">❌ Wrong</div>
                </div>

                <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl p-4 border-2 border-purple-300">
                    <div className="flex items-center justify-center mb-2">
                        <TrophyIcon className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600">{result.totalQuestions}</div>
                    <div className="text-sm font-bold text-purple-700">📝 Total</div>
                </div>

                <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl p-4 border-2 border-blue-300">
                    <div className="flex items-center justify-center mb-2">
                        <ClockIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600">{formatTime(result.duration)}</div>
                    <div className="text-sm font-bold text-blue-700">⏰ Time</div>
                </div>
            </div>

            {/* Performance Breakdown */}
            <div className="mb-8">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div className="h-full flex">
                        <div
                            className="bg-green-500 transition-all duration-1000"
                            style={{ width: `${(result.correctAnswers / result.totalQuestions) * 100}%` }}
                        />
                        <div
                            className="bg-red-500 transition-all duration-1000"
                            style={{ width: `${(result.incorrectAnswers / result.totalQuestions) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{result.correctAnswers} correct</span>
                    <span>{result.incorrectAnswers} incorrect</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                {!isSaved && (
                    <Button
                        onClick={handleSaveToLeaderboard}
                        disabled={saving}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold rounded-full px-6 py-3 transition-all duration-200 hover:scale-105"
                    >
                        <SaveIcon className="w-5 h-5" />
                        {saving ? '💾 Saving...' : '💾 Save Score!'}
                    </Button>
                )}

                {isSaved && (
                    <div className="flex items-center gap-2 text-green-600 font-bold mb-4 bg-green-100 px-4 py-2 rounded-full border-2 border-green-300">
                        <CheckCircleIcon className="w-6 h-6" />
                        <span>🎉 Saved to Leaderboard! 🎉</span>
                    </div>
                )}

                <Button
                    onClick={() => navigate('/leaderboard')}
                    variant="outline"
                    className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300 font-bold rounded-full px-6 py-3 transition-all duration-200 hover:scale-105"
                >
                    <TrophyIcon className="w-5 h-5" />
                    🏆 View Leaderboard
                </Button>

                <Button
                    onClick={onRestart}
                    variant="outline"
                    className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-300 font-bold rounded-full px-6 py-3 transition-all duration-200 hover:scale-105"
                >
                    <RotateCcwIcon className="w-5 h-5" />
                    🔄 Try Again
                </Button>
                <Button
                    onClick={onNewQuiz}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold rounded-full px-6 py-3 transition-all duration-200 hover:scale-105"
                >
                    <PlusIcon className="w-5 h-5" />
                    🎯 New Topic
                </Button>
            </div>
        </div>
    );
};

export default ScoreDisplay;
