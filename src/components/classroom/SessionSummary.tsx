'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import SocratesAvatar from '@/components/avatar/SocratesAvatar';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatPercentage } from '@/lib/utils';

interface SessionSummaryProps {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  knowledgeAccuracy: number;
  wisdomAccuracy: number;
  maxStreak: number;
  xpEarned: number;
  sessionStatus: 'completed' | 'failed';
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export default function SessionSummary({
  totalQuestions,
  correctAnswers,
  accuracy,
  knowledgeAccuracy,
  wisdomAccuracy,
  maxStreak,
  xpEarned,
  sessionStatus,
  onPlayAgain,
  onGoHome,
}: SessionSummaryProps) {
  const isSuccess = sessionStatus === 'completed';

  const getMessage = () => {
    if (!isSuccess) {
      return "Don't worry! Every great explorer faces challenges. Let's try again!";
    }
    if (accuracy >= 0.9) {
      return "Outstanding! You're becoming a true history master!";
    }
    if (accuracy >= 0.7) {
      return 'Great job! You learned a lot today!';
    }
    return "Good effort! Keep practicing and you'll get even better!";
  };

  const stats = [
    {
      label: 'Questions',
      value: `${correctAnswers}/${totalQuestions}`,
      icon: '📝',
    },
    {
      label: 'Accuracy',
      value: formatPercentage(accuracy),
      icon: '🎯',
    },
    {
      label: 'Best Streak',
      value: maxStreak.toString(),
      icon: '🔥',
    },
    {
      label: 'XP Earned',
      value: xpEarned.toString(),
      icon: '⭐',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`text-3xl font-bold mb-2 ${
              isSuccess ? 'text-green-600' : 'text-amber-600'
            }`}
          >
            {isSuccess ? '🎉 Session Complete!' : '💪 Keep Going!'}
          </motion.h1>
        </div>

        {/* Avatar with message */}
        <div className="flex justify-center mb-8">
          <SocratesAvatar
            emotion={isSuccess ? 'celebrating' : 'encouraging'}
            message={getMessage()}
            showMessage={true}
          />
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-gray-50 rounded-xl p-4 text-center"
            >
              <span className="text-2xl mb-2 block">{stat.icon}</span>
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              <span className="text-sm text-gray-500 block">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Breakdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-4 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-700">Your Progress</h3>
          <ProgressBar
            value={Math.round(knowledgeAccuracy * 100)}
            max={100}
            type="knowledge"
            label={`Knowledge: ${formatPercentage(knowledgeAccuracy)}`}
          />
          <ProgressBar
            value={Math.round(wisdomAccuracy * 100)}
            max={100}
            type="wisdom"
            label={`Wisdom: ${formatPercentage(wisdomAccuracy)}`}
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex gap-4"
        >
          <Button onClick={onGoHome} variant="secondary" className="flex-1">
            Go Home
          </Button>
          <Button onClick={onPlayAgain} className="flex-1">
            Play Again
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
