import React from 'react';

interface AnswerInputProps {
    value: string;
    digitCount: number;
    isCorrect?: boolean | null;
    showResult?: boolean;
}

const AnswerInput: React.FC<AnswerInputProps> = ({
    value,
    digitCount,
    isCorrect = null,
    showResult = false
}) => {
    const digits = value.padStart(digitCount, ' ').split('');

    const getBoxColor = (index: number) => {
        if (showResult) {
            return isCorrect
                ? 'bg-green-100 border-green-400 text-green-800'
                : 'bg-red-100 border-red-400 text-red-800';
        }

        if (digits[index] !== ' ') {
            return 'bg-blue-50 border-blue-400 text-blue-800';
        }

        return 'bg-gray-50 border-gray-300 text-gray-500';
    };

    return (
        <div className="flex justify-center gap-3 mb-6">
            {Array.from({ length: digitCount }).map((_, index) => (
                <div
                    key={index}
                    className={`w-16 h-20 flex items-center justify-center text-3xl font-bold rounded-xl border-4 transition-all duration-300 shadow-lg ${getBoxColor(index)}`}
                >
                    {digits[index] !== ' ' ? digits[index] : ''}
                </div>
            ))}
        </div>
    );
};

export default AnswerInput;
