import React from 'react';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

interface NumberPadProps {
    onNumberClick: (number: number) => void;
    onClear: () => void;
    onBackspace: () => void;
    disabled?: boolean;
}

const NumberPad: React.FC<NumberPadProps> = ({
    onNumberClick,
    onClear,
    onBackspace,
    disabled = false
}) => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border-4 border-purple-200">
            <div className="grid grid-cols-3 gap-3">
                {/* Numbers 1-9 */}
                {numbers.slice(0, 9).map(num => (
                    <Button
                        key={num}
                        onClick={() => onNumberClick(num)}
                        disabled={disabled}
                        className="h-16 text-2xl font-bold bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                    >
                        {num}
                    </Button>
                ))}

                {/* Clear button */}
                <Button
                    onClick={onClear}
                    disabled={disabled}
                    className="h-16 text-lg font-bold bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                >
                    Clear
                </Button>

                {/* Zero */}
                <Button
                    onClick={() => onNumberClick(0)}
                    disabled={disabled}
                    className="h-16 text-2xl font-bold bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                >
                    0
                </Button>

                {/* Backspace button */}
                <Button
                    onClick={onBackspace}
                    disabled={disabled}
                    className="h-16 text-lg font-bold bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-0 flex items-center justify-center"
                >
                    <Trash2 className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
};

export default NumberPad;
