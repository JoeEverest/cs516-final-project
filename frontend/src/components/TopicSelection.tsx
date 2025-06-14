import React from 'react';
import { Button } from '@/components/ui/button';
import { Topic } from '@/model/user';
import { BookOpenIcon, GlobeIcon, BeakerIcon, ScrollIcon, Calculator } from 'lucide-react';

interface TopicSelectionProps {
    topics: Topic[];
    onTopicSelect: (topic: Topic) => void;
}

const getTopicIcon = (topicId: string) => {
    switch (topicId) {
        case 'english_vocabulary':
            return <BookOpenIcon className="w-8 h-8" />;
        case 'geography':
            return <GlobeIcon className="w-8 h-8" />;
        case 'science':
            return <BeakerIcon className="w-8 h-8" />;
        case 'world_history':
            return <ScrollIcon className="w-8 h-8" />;
        case 'math':
            return <Calculator className="w-8 h-8" />;
        default:
            return <BookOpenIcon className="w-8 h-8" />;
    }
};

const getTopicColor = (topicId: string) => {
    switch (topicId) {
        case 'english_vocabulary':
            return 'from-emerald-400 to-teal-500';
        case 'geography':
            return 'from-blue-400 to-cyan-500';
        case 'science':
            return 'from-purple-400 to-indigo-500';
        case 'world_history':
            return 'from-orange-400 to-red-500';
        case 'math':
            return 'from-pink-400 to-rose-500';
        default:
            return 'from-gray-400 to-gray-600';
    }
};

const TopicSelection: React.FC<TopicSelectionProps> = ({ topics, onTopicSelect }) => {
    return (
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-yellow-300">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-center mb-2 text-purple-700">
                    🎯 Choose Your Quiz Topic 🎯
                </h2>
                <p className="text-center text-gray-600 text-lg">
                    Pick a topic and show off your amazing knowledge! 🌟
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topics.map((topic) => (
                    <div
                        key={topic.id}
                        className="group cursor-pointer"
                        onClick={() => onTopicSelect(topic)}
                    >
                        <div className={`bg-gradient-to-r ${getTopicColor(topic.id)} rounded-2xl p-6 text-white transform transition-all ease-in duration-100 hover:scale-110 hover:shadow-2xl hover:rotate-1`}>
                            <div className="flex items-center justify-center mb-4">
                                <div className="bg-white/30 rounded-full p-4 backdrop-blur-sm">
                                    {getTopicIcon(topic.id)}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-center mb-2">{topic.name}</h3>
                            <p className="text-center text-white/90 text-sm mb-4">
                                Ready to become a {topic.name.toLowerCase()} expert? 🏆
                            </p>
                            <div className="mt-4 flex justify-center">
                                <Button
                                    variant="secondary"
                                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-bold text-lg px-6 py-2 rounded-full transition-all duration-200 hover:scale-105"
                                >
                                    🚀 Start Quiz
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopicSelection;
