import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, Target, Zap } from 'lucide-react';
import NumberPad from './NumberPad';
import AnswerInput from './AnswerInput';
import { MathQuestion } from '../model/user';
import { generateMathQuizSession, getAnswerDigitCount } from '../lib/mathUtils';

interface MathQuizProps {
    onComplete: (result: MathQuizResult) => void;
    onBack: () => void;
}

export interface MathQuizResult {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    score: number;
    duration: number;
    questions: MathQuestion[];
    userAnswers: (number | null)[];
}

const MathQuiz: React.FC<MathQuizProps> = ({ onComplete, onBack }) => {
    const [questions] = useState<MathQuestion[]>(() => generateMathQuizSession());
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>(new Array(20).fill(null));
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [startTime] = useState(Date.now());
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const currentQuestion = questions[currentQuestionIndex];
    const expectedDigits = getAnswerDigitCount(currentQuestion.answer);
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    useEffect(() => {
        // Reset answer input when moving to next question
        setCurrentAnswer('');
        setShowResult(false);
        setIsCorrect(null);
    }, [currentQuestionIndex]);

    const handleNumberClick = (number: number) => {
        if (currentAnswer.length < expectedDigits && !showResult) {
            setCurrentAnswer(prev => prev + number.toString());
        }
    };

    const handleClear = () => {
        if (!showResult) {
            setCurrentAnswer('');
        }
    };

    const handleBackspace = () => {
        if (!showResult) {
            setCurrentAnswer(prev => prev.slice(0, -1));
        }
    };

    const handleSubmitAnswer = () => {
        if (currentAnswer === '' || showResult) return;

        const userAnswer = parseInt(currentAnswer);
        const correct = userAnswer === currentQuestion.answer;

        setIsCorrect(correct);
        setShowResult(true);

        // Update user answers
        const newUserAnswers = [...userAnswers];
        newUserAnswers[currentQuestionIndex] = userAnswer;
        setUserAnswers(newUserAnswers);

        // Auto-advance to next question after 1.5 seconds
        setTimeout(() => {
            if (currentQuestionIndex === questions.length - 1) {
                // Quiz complete
                handleQuizComplete(newUserAnswers);
            } else {
                setCurrentQuestionIndex(prev => prev + 1);
            }
        }, 1500);
    };

    const handleQuizComplete = (finalAnswers: (number | null)[]) => {
        const duration = Date.now() - startTime;
        const correctCount = finalAnswers.filter((answer, index) =>
            answer === questions[index].answer
        ).length;
        const incorrectCount = questions.length - correctCount;
        const score = Math.round((correctCount / questions.length) * 100);

        const result: MathQuizResult = {
            totalQuestions: questions.length,
            correctAnswers: correctCount,
            incorrectAnswers: incorrectCount,
            score,
            duration,
            questions,
            userAnswers: finalAnswers
        };

        onComplete(result);
    };

    const getOperationColor = (operation: string) => {
        switch (operation) {
            case 'addition': return 'from-green-400 to-green-600';
            case 'subtraction': return 'from-red-400 to-red-600';
            case 'multiplication': return 'from-purple-400 to-purple-600';
            case 'division': return 'from-orange-400 to-orange-600';
            default: return 'from-blue-400 to-blue-600';
        }
    };

    const getOperationEmoji = (operation: string) => {
        switch (operation) {
            case 'addition': return '➕';
            case 'subtraction': return '➖';
            case 'multiplication': return '✖️';
            case 'division': return '➗';
            default: return '🧮';
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    onClick={onBack}
                    variant="outline"
                    className="flex items-center gap-2 bg-white border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-blue-300 shadow-lg">
                        <Target className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-blue-800">
                            {currentQuestionIndex + 1} / {questions.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-green-300 shadow-lg">
                        <Zap className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-800">Math Sprint</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-full p-2 mb-8 border-4 border-purple-200 shadow-lg">
                <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl p-8 mb-8 border-4 border-purple-200 shadow-xl">
                <div className="text-center mb-6">
                    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r ${getOperationColor(currentQuestion.action)} text-white text-lg font-bold shadow-lg mb-4`}>
                        <span className="text-2xl">{getOperationEmoji(currentQuestion.action)}</span>
                        {currentQuestion.action.charAt(0).toUpperCase() + currentQuestion.action.slice(1)}
                    </div>

                    <div className="text-5xl font-bold text-gray-800 mb-6 font-mono">
                        {currentQuestion.questionText}
                    </div>
                </div>

                {/* Answer Input */}
                <AnswerInput
                    value={currentAnswer}
                    digitCount={expectedDigits}
                    isCorrect={isCorrect}
                    showResult={showResult}
                />

                {/* Submit Button */}
                <div className="flex justify-center mb-6">
                    <Button
                        onClick={handleSubmitAnswer}
                        disabled={currentAnswer === '' || showResult}
                        className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                    >
                        {showResult ? (isCorrect ? '✅ Correct!' : '❌ Try Next Time!') : 'Submit Answer'}
                    </Button>
                </div>
            </div>

            {/* Number Pad */}
            <div className="flex justify-center">
                <NumberPad
                    onNumberClick={handleNumberClick}
                    onClear={handleClear}
                    onBackspace={handleBackspace}
                    disabled={showResult}
                />
            </div>
        </div>
    );
};

export default MathQuiz;
