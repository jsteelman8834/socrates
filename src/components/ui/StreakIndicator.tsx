'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreakIndicatorProps {
  streak: number;
  maxStreak: number;
}

export default function StreakIndicator({ streak, maxStreak }: StreakIndicatorProps) {
  const isOnFire = streak >= 3;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {isOnFire ? (
            <motion.div
              key="fire"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="relative"
            >
              <motion.span
                className="text-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                🔥
              </motion.span>
            </motion.div>
          ) : streak > 0 ? (
            <motion.span
              key="spark"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-2xl"
            >
              ⚡
            </motion.span>
          ) : null}
        </AnimatePresence>

        <div className="flex flex-col">
          <motion.span
            key={streak}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn(
              'text-2xl font-bold',
              isOnFire ? 'text-orange-500' : streak > 0 ? 'text-yellow-500' : 'text-gray-400'
            )}
          >
            {streak}
          </motion.span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Streak</span>
        </div>
      </div>

      {maxStreak > 0 && maxStreak > streak && (
        <span className="text-xs text-gray-400 mt-1">
          Best: {maxStreak}
        </span>
      )}
    </div>
  );
}
