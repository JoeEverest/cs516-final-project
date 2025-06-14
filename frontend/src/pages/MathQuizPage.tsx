import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import MathQuiz, { MathQuizResult } from '../components/MathQuiz';
import MathScoreDisplay from '../components/MathScoreDisplay';

type MathQuizPageState = 'quiz' | 'score';

const MathQuizPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentState, setCurrentState] = useState<MathQuizPageState>('quiz');
    const [quizResult, setQuizResult] = useState<MathQuizResult | null>(null);

    const handleQuizComplete = (result: MathQuizResult) => {
        setQuizResult(result);
        setCurrentState('score');
    };

    const handleBack = () => {
        navigate('/');
    };

    const handleRestart = () => {
        setQuizResult(null);
        setCurrentState('quiz');
    };

    return (
        <>
            {currentState === 'quiz' && (
                <MathQuiz
                    onComplete={handleQuizComplete}
                    onBack={handleBack}
                />
            )}

            {currentState === 'score' && quizResult && (
                <MathScoreDisplay
                    result={quizResult}
                    onRestart={handleRestart}
                />
            )}
        </>
    );
};

export default MathQuizPage;
