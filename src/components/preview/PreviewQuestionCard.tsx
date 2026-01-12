'use client';

import { motion } from 'framer-motion';
import { BookOpen, Lightbulb } from 'lucide-react';
import type { PreviewQuestion } from '@/store/previewSessionStore';

interface PreviewQuestionCardProps {
  question: PreviewQuestion;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function PreviewQuestionCard({
  question,
  selectedOptionId,
  onSelectOption,
  onSubmit,
  isSubmitting = false,
}: PreviewQuestionCardProps) {
  const isKnowledge = question.questionType === 'knowledge';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Question type badge and topic */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isKnowledge ? (
            <BookOpen size={16} className="text-sky-400" />
          ) : (
            <Lightbulb size={16} className="text-amber-400" />
          )}
          <span
            className={`font-mono text-xs uppercase tracking-wider ${
              isKnowledge ? 'text-sky-400' : 'text-amber-400'
            }`}
          >
            {isKnowledge ? 'Knowledge' : 'Wisdom'}
          </span>
        </div>
        <span className="font-mono text-xs text-slate-500">{question.topicLabel}</span>
      </div>

      {/* Question text */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
        <p className="text-amber-50 text-xl font-serif leading-relaxed">
          {question.questionText}
        </p>
      </div>

      {/* Answer options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectOption(option.id)}
            disabled={isSubmitting}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${
              selectedOptionId === option.id
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {/* Option label */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold ${
                selectedOptionId === option.id
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {option.label}
            </div>

            {/* Option text */}
            <span
              className={`text-base leading-relaxed ${
                selectedOptionId === option.id ? 'text-amber-50' : 'text-slate-300'
              }`}
            >
              {option.text}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Submit button */}
      <motion.button
        whileHover={selectedOptionId && !isSubmitting ? { scale: 1.02 } : {}}
        whileTap={selectedOptionId && !isSubmitting ? { scale: 0.98 } : {}}
        onClick={onSubmit}
        disabled={!selectedOptionId || isSubmitting}
        className={`w-full py-4 rounded-xl font-mono text-sm uppercase tracking-widest transition-all ${
          selectedOptionId && !isSubmitting
            ? 'bg-amber-600 text-white hover:bg-amber-500 cursor-pointer'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Checking...' : 'Submit Answer'}
      </motion.button>
    </motion.div>
  );
}
