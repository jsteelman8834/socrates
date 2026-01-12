'use client';

import { Heart, Flame, BookOpen, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface PreviewHeaderProps {
  currentBatch: 1 | 2 | 3;
  questionInBatch: number; // 0-4
  heartsRemaining: number;
  currentStreak: number;
  knowledgeProgress: number; // 0-100
  wisdomProgress: number; // 0-100
}

export default function PreviewHeader({
  currentBatch,
  questionInBatch,
  heartsRemaining,
  currentStreak,
  knowledgeProgress,
  wisdomProgress,
}: PreviewHeaderProps) {
  const tierLabels = ['Foundation', 'Challenge', 'Mastery'];
  const tierColors = ['text-emerald-400', 'text-amber-400', 'text-violet-400'];

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Top row: Tier, Hearts, Streak */}
        <div className="flex items-center justify-between mb-4">
          {/* Tier indicator */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-500 text-xs uppercase tracking-wider">Tier {currentBatch}</span>
            <span className={`font-serif text-lg ${tierColors[currentBatch - 1]}`}>
              {tierLabels[currentBatch - 1]}
            </span>
          </div>

          {/* Hearts */}
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heart) => (
              <motion.div
                key={heart}
                animate={
                  heart === heartsRemaining + 1
                    ? { scale: [1, 0.8, 1], opacity: [1, 0.5, 0] }
                    : {}
                }
                transition={{ duration: 0.3 }}
              >
                <Heart
                  size={24}
                  className={
                    heart <= heartsRemaining
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-slate-700'
                  }
                />
              </motion.div>
            ))}
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2">
            <Flame
              size={20}
              className={currentStreak > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-600'}
            />
            <span
              className={`font-mono text-lg ${
                currentStreak > 0 ? 'text-amber-400' : 'text-slate-600'
              }`}
            >
              {currentStreak}
            </span>
          </div>
        </div>

        {/* Progress bars */}
        <div className="grid grid-cols-2 gap-4">
          {/* Knowledge Progress */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-sky-400" />
              <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                Knowledge
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${knowledgeProgress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Wisdom Progress */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-amber-400" />
              <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                Wisdom
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${wisdomProgress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Question counter */}
        <div className="mt-3 flex justify-center">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((q) => (
              <div
                key={q}
                className={`w-2 h-2 rounded-full transition-colors ${
                  q < questionInBatch
                    ? 'bg-amber-500'
                    : q === questionInBatch
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
