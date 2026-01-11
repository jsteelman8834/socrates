'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface HeartsProps {
  current: number;
  max: number;
}

export default function Hearts({ current, max }: HeartsProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, index) => (
        <AnimatePresence key={index} mode="wait">
          {index < current ? (
            <motion.span
              key={`full-${index}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, rotate: -180 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="text-2xl"
            >
              ❤️
            </motion.span>
          ) : (
            <motion.span
              key={`empty-${index}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              className="text-2xl grayscale"
            >
              🖤
            </motion.span>
          )}
        </AnimatePresence>
      ))}
    </div>
  );
}
