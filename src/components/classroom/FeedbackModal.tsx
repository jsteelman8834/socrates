'use client';

import { motion, AnimatePresence } from 'framer-motion';
import SocratesAvatar from '@/components/avatar/SocratesAvatar';
import Button from '@/components/ui/Button';
import type { TutorFeedback, AvatarEmotion } from '@/types';
import { cn } from '@/lib/utils';

interface FeedbackModalProps {
  isOpen: boolean;
  feedback: TutorFeedback | null;
  onContinue: () => void;
  tierChanged?: boolean;
  tierDirection?: 'up' | 'down' | null;
  currentTier?: number;
}

export default function FeedbackModal({
  isOpen,
  feedback,
  onContinue,
  tierChanged = false,
  tierDirection = null,
  currentTier = 1,
}: FeedbackModalProps) {
  if (!feedback) return null;

  const backdropColor = feedback.isCorrect
    ? 'bg-green-500/20'
    : 'bg-red-500/20';

  const borderColor = feedback.isCorrect
    ? 'border-green-500'
    : 'border-red-500';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center p-4',
            backdropColor
          )}
        >
          {/* Celebration particles for correct answers */}
          {feedback.isCorrect && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    x: '50vw',
                    y: '50vh',
                    scale: 0,
                  }}
                  animate={{
                    opacity: 0,
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`,
                    scale: Math.random() * 2 + 1,
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.05,
                    ease: 'easeOut',
                  }}
                  className="absolute text-3xl"
                >
                  {['⭐', '✨', '🎉', '💫', '🌟'][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className={cn(
              'bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full border-4',
              borderColor
            )}
          >
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <SocratesAvatar
                emotion={feedback.avatarEmotion}
                message={feedback.feedbackText}
                showMessage={true}
              />
            </div>

            {/* XP Earned */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="flex justify-center items-center gap-2 mb-4"
            >
              <span className="text-3xl">⭐</span>
              <span className="text-2xl font-bold text-primary-600">
                +{feedback.xpEarned} XP
              </span>
              {feedback.streakBonus && (
                <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                  🔥 Streak Bonus!
                </span>
              )}
            </motion.div>

            {/* Tier Change Notification */}
            {tierChanged && tierDirection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className={cn(
                  'text-center py-3 px-4 rounded-xl mb-4',
                  tierDirection === 'up'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {tierDirection === 'up' ? (
                  <>
                    <span className="text-2xl">🚀</span>
                    <span className="ml-2 font-bold">Level Up! Now at Tier {currentTier}</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">📉</span>
                    <span className="ml-2">Difficulty adjusted to Tier {currentTier}</span>
                  </>
                )}
              </motion.div>
            )}

            {/* Correct Answer (if wrong) */}
            {!feedback.isCorrect && feedback.correctAnswer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4"
              >
                <p className="text-sm text-green-600 font-medium mb-1">
                  ✓ Correct Answer:
                </p>
                <p className="text-green-800">{feedback.correctAnswer.text}</p>
              </motion.div>
            )}

            {/* Follow-up Question (for Wisdom) */}
            {feedback.followUpQuestion && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4"
              >
                <p className="text-sm text-amber-600 font-medium mb-1">
                  🤔 Think about this:
                </p>
                <p className="text-amber-800 italic">{feedback.followUpQuestion}</p>
              </motion.div>
            )}

            {/* Continue Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex justify-center"
            >
              <Button onClick={onContinue} size="lg">
                Continue
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
