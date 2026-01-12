'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Quote } from 'lucide-react';
import BenFranklinAvatar from './BenFranklinAvatar';
import type { PreviewFeedback } from '@/store/previewSessionStore';

interface PreviewFeedbackModalProps {
  feedback: PreviewFeedback | null;
  onDismiss: () => void;
}

export default function PreviewFeedbackModal({
  feedback,
  onDismiss,
}: PreviewFeedbackModalProps) {
  if (!feedback) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl"
        >
          {/* Result indicator */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                feedback.isCorrect
                  ? 'bg-emerald-500/20 border-2 border-emerald-500'
                  : 'bg-rose-500/20 border-2 border-rose-500'
              }`}
            >
              {feedback.isCorrect ? (
                <Check size={32} className="text-emerald-400" />
              ) : (
                <X size={32} className="text-rose-400" />
              )}
            </motion.div>
          </div>

          {/* Status text */}
          <h3
            className={`text-center font-serif text-2xl mb-6 ${
              feedback.isCorrect ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {feedback.isCorrect ? 'Excellent!' : 'Not quite...'}
          </h3>

          {/* Franklin avatar and message */}
          <div className="flex flex-col items-center mb-6">
            <BenFranklinAvatar
              emotion={feedback.emotion}
              message={feedback.feedbackText}
              showMessage={true}
              size="sm"
            />
          </div>

          {/* Correct answer (if wrong) */}
          {!feedback.isCorrect && feedback.correctAnswer && (
            <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-xl">
              <p className="text-slate-400 text-sm font-mono uppercase tracking-wider mb-2">
                Correct Answer
              </p>
              <p className="text-amber-50 text-base">
                <span className="font-bold text-amber-400 mr-2">
                  {feedback.correctAnswer.optionId.toUpperCase()}.
                </span>
                {feedback.correctAnswer.text}
              </p>
            </div>
          )}

          {/* Aphorism (if included) */}
          {feedback.aphorism && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <Quote size={20} className="text-amber-500 flex-shrink-0 mt-1" />
                <p className="text-amber-200 text-sm italic font-serif">
                  "{feedback.aphorism}"
                  <span className="block text-amber-500/70 text-xs mt-1 not-italic">
                    — Poor Richard's Almanack
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Continue button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDismiss}
            className="w-full py-4 bg-amber-600 text-white rounded-xl font-mono text-sm uppercase tracking-widest hover:bg-amber-500 transition-colors"
          >
            Continue
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
