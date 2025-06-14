import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Topic, Questions } from '@/model/user';
import { QuizResult } from './QuizApp';
import { ArrowLeftIcon, ClockIcon } from 'lucide-react';

interface QuizProps {
    topic: Topic;
    questions: Questions[];
    onQuizComplete: (result: QuizResult) => void;
    onBack: () => void;
}

const Quiz: React.FC<QuizProps> = ({ topic, questions, onQuizComplete, onBack }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [startTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeElapsed(Date.now() - startTime);
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime]);

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const handleAnswerSelect = (answer: string) => {
        setSelectedAnswer(answer);
    };

    const handleNext = () => {
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = selectedAnswer;
        setUserAnswers(newAnswers);

        if (isLastQuestion) {
            // Calculate results
            const correctAnswers = newAnswers.reduce((count, answer, index) => {
                return answer === questions[index].correctAnswer ? count + 1 : count;
            }, 0);

            const score = Math.round((correctAnswers / questions.length) * 100);
            const duration = Date.now() - startTime;

            const result: QuizResult = {
                topicId: topic.id,
                topicName: topic.name,
                score,
                totalQuestions: questions.length,
                duration,
                correctAnswers,
                incorrectAnswers: questions.length - correctAnswers,
            };

            onQuizComplete(result);
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer('');
        }
    };

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-pink-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full px-4 py-2 font-bold transition-all duration-200 hover:scale-105"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    🏠 Back to Topics
                </Button>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-100 px-3 py-2 rounded-full font-bold">
                        <ClockIcon className="w-4 h-4" />
                        ⏰ {formatTime(timeElapsed)}
                    </div>
                    <div className="text-sm text-purple-600 bg-purple-100 px-3 py-2 rounded-full font-bold">
                        📝 Question {currentQuestionIndex + 1} of {questions.length}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-8 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500 relative"
                    style={{ width: `${progressPercentage}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
            </div>

            {/* Topic and Question */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-purple-600 mb-4 text-center">
                    🎯 {topic.name} Challenge 🎯
                </h2>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center bg-yellow-100 p-4 rounded-2xl border-2 border-yellow-300">
                    {currentQuestion.question}
                </h3>
            </div>

            {/* Answer Options */}
            <div className="space-y-4 mb-8">
                {currentQuestion.answer.map((answer, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerSelect(answer)}
                        className={`w-full p-4 text-left rounded-2xl border-3 transition-all duration-200 transform hover:scale-105 ${selectedAnswer === answer
                            ? 'border-green-500 bg-green-100 text-green-700 shadow-lg scale-105'
                            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={`w-8 h-8 rounded-full border-3 flex items-center justify-center font-bold text-lg ${selectedAnswer === answer
                                    ? 'border-green-500 bg-green-500 text-white'
                                    : 'border-gray-400 bg-white text-gray-600'
                                    }`}
                            >
                                {selectedAnswer === answer ? '✓' : String.fromCharCode(65 + index)}
                            </div>
                            <span className="font-medium text-lg">{answer}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleNext}
                    disabled={!selectedAnswer}
                    className="px-8 py-3 text-lg font-bold bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-full transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:scale-100"
                >
                    {isLastQuestion ? '🎉 Finish Quiz!' : '➡️ Next Question'}
                </Button>
            </div>
        </div>
    );
};

export default Quiz;
