'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnswerOption {
  id: string;
  label: string;
  text: string;
}

interface QuestionCardProps {
  questionText: string;
  questionType: 'knowledge' | 'wisdom';
  options: AnswerOption[];
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  disabled?: boolean;
  correctOptionId?: string;
  showResult?: boolean;
}

export default function QuestionCard({
  questionText,
  questionType,
  options,
  selectedOptionId,
  onSelectOption,
  disabled = false,
  correctOptionId,
  showResult = false,
}: QuestionCardProps) {
  const typeStyles = {
    knowledge: {
      badge: 'bg-blue-100 text-blue-700',
      icon: '📚',
      label: 'Knowledge',
    },
    wisdom: {
      badge: 'bg-amber-100 text-amber-700',
      icon: '🦉',
      label: 'Wisdom',
    },
  };

  const styles = typeStyles[questionType];

  const getOptionStyles = (optionId: string) => {
    if (!showResult) {
      if (selectedOptionId === optionId) {
        return 'border-primary-500 bg-primary-50 ring-2 ring-primary-500';
      }
      return 'border-gray-200 hover:border-primary-300 hover:bg-gray-50';
    }

    // Show result mode
    if (optionId === correctOptionId) {
      return 'border-green-500 bg-green-50 ring-2 ring-green-500';
    }
    if (selectedOptionId === optionId && optionId !== correctOptionId) {
      return 'border-red-500 bg-red-50 ring-2 ring-red-500';
    }
    return 'border-gray-200 opacity-50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl w-full"
    >
      {/* Question Type Badge */}
      <div className="flex justify-between items-center mb-4">
        <span className={cn('px-3 py-1 rounded-full text-sm font-medium', styles.badge)}>
          {styles.icon} {styles.label}
        </span>
      </div>

      {/* Question Text */}
      <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
        {questionText}
      </h2>

      {/* Answer Options */}
      <div className="space-y-3">
        {options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => !disabled && onSelectOption(option.id)}
            disabled={disabled}
            className={cn(
              'w-full text-left p-4 rounded-xl border-2 transition-all duration-200',
              getOptionStyles(option.id),
              disabled && !showResult && 'cursor-not-allowed opacity-50'
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                  selectedOptionId === option.id && !showResult
                    ? 'bg-primary-500 text-white'
                    : showResult && option.id === correctOptionId
                    ? 'bg-green-500 text-white'
                    : showResult && selectedOptionId === option.id && option.id !== correctOptionId
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {option.label}
              </span>
              <span className="text-gray-800 pt-1">{option.text}</span>
            </div>

            {/* Result indicators */}
            {showResult && (
              <div className="mt-2 ml-11">
                {option.id === correctOptionId && (
                  <span className="text-green-600 text-sm font-medium">✓ Correct answer</span>
                )}
                {selectedOptionId === option.id && option.id !== correctOptionId && (
                  <span className="text-red-600 text-sm font-medium">✗ Your answer</span>
                )}
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
