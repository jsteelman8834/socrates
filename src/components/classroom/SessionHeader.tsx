'use client';

import { motion } from 'framer-motion';
import Hearts from '@/components/ui/Hearts';
import StreakIndicator from '@/components/ui/StreakIndicator';
import ProgressBar from '@/components/ui/ProgressBar';
import { getTierName, getTierColor } from '@/lib/utils';

interface SessionHeaderProps {
  currentTier: number;
  heartsRemaining: number;
  maxHearts: number;
  currentStreak: number;
  maxStreak: number;
  knowledgeProgress: number;
  wisdomProgress: number;
  knowledgeGoal: number;
  wisdomGoal: number;
  questionsAnswered: number;
  totalQuestions: number;
  totalXp: number;
}

export default function SessionHeader({
  currentTier,
  heartsRemaining,
  maxHearts,
  currentStreak,
  maxStreak,
  knowledgeProgress,
  wisdomProgress,
  knowledgeGoal,
  wisdomGoal,
  questionsAnswered,
  totalQuestions,
  totalXp,
}: SessionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-4 mb-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Tier Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getTierColor(currentTier)} text-white font-bold shadow-md`}
          >
            Tier {currentTier}: {getTierName(currentTier)}
          </div>
          <div className="text-sm text-gray-500">
            Question {questionsAnswered + 1}/{totalQuestions}
          </div>
        </div>

        {/* Hearts */}
        <Hearts current={heartsRemaining} max={maxHearts} />

        {/* Streak */}
        <StreakIndicator streak={currentStreak} maxStreak={maxStreak} />

        {/* XP */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary-600">{totalXp}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide">XP</span>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <ProgressBar
          value={knowledgeProgress}
          max={knowledgeGoal}
          type="knowledge"
          size="sm"
        />
        <ProgressBar
          value={wisdomProgress}
          max={wisdomGoal}
          type="wisdom"
          size="sm"
        />
      </div>
    </motion.div>
  );
}
