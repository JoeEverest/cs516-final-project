import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Quiz from '../components/Quiz';
import ScoreDisplay from '../components/ScoreDisplay';
import { Topic, Questions } from '../model/user';
import { topics, allQuestions } from '../data';
import { QuizResult } from '../components/QuizApp';

type QuizPageState = 'quiz' | 'score';

const QuizPage: React.FC = () => {
    const { topicId } = useParams<{ topicId: string }>();
    const navigate = useNavigate();
    const [currentState, setCurrentState] = useState<QuizPageState>('quiz');
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    useEffect(() => {
        if (topicId) {
            const topic = topics.find(t => t.id === topicId);
            if (topic) {
                setSelectedTopic(topic);
            } else {
                // If topic not found, redirect to home
                navigate('/');
            }
        }
    }, [topicId, navigate]);

    const handleQuizComplete = (result: QuizResult) => {
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

    const handleNewQuiz = () => {
        navigate('/');
    };

    const getQuestionsForTopic = (topicId: string): Questions[] => {
        return allQuestions.filter(q => q.topicId === topicId);
    };

    if (!selectedTopic) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {currentState === 'quiz' && (
                <Quiz
                    topic={selectedTopic}
                    questions={getQuestionsForTopic(selectedTopic.id)}
                    onQuizComplete={handleQuizComplete}
                    onBack={handleBack}
                />
            )}

            {currentState === 'score' && quizResult && (
                <ScoreDisplay
                    result={quizResult}
                    onRestart={handleRestart}
                    onNewQuiz={handleNewQuiz}
                />
            )}
        </>
    );
};

export default QuizPage;
