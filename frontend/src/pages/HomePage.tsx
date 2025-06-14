import React from 'react';
import { useNavigate } from 'react-router';
import TopicSelection from '../components/TopicSelection';
import { Button } from '../components/ui/button';
import { Topic } from '../model/user';
import { topics } from '../data';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const handleTopicSelect = (topic: Topic) => {
        if (topic.id === 'math') {
            navigate('/quiz/math');
        } else {
            navigate(`/quiz/${topic.id}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-center mb-6">
                <Button
                    onClick={() => navigate('/leaderboard')}
                    variant="outline"
                    className="flex items-center gap-2 bg-yellow-100 border-yellow-400 text-yellow-700 hover:bg-yellow-200 font-bold text-lg px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 shadow-lg"
                >
                    🏆 View Leaderboard 🏆
                </Button>
            </div>

            <TopicSelection
                topics={topics}
                onTopicSelect={handleTopicSelect}
            />
        </div>
    );
};

export default HomePage;
