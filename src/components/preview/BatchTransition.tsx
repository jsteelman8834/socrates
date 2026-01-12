'use client';

import { motion } from 'framer-motion';
import { ArrowUp, Flame, Target } from 'lucide-react';
import BenFranklinAvatar from './BenFranklinAvatar';

interface BatchTransitionProps {
  completedBatch: 1 | 2;
  nextBatch: 2 | 3;
  knowledgeScore: number;
  wisdomScore: number;
  currentStreak: number;
  onContinue: () => void;
}

const batchMessages = {
  2: "Capital work! You've mastered the foundations. Now let us test your mettle with more challenging questions. As I always say, 'By failing to prepare, you are preparing to fail.' But you, my friend, are well prepared!",
  3: "Most impressive! You've proven yourself ready for the pinnacle of our examination. These final questions will truly test your understanding. Remember: 'An investment in knowledge pays the best interest.'",
};

const tierInfo = {
  2: {
    name: 'Challenge',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    description: 'Questions now require more precise knowledge and understanding.',
  },
  3: {
    name: 'Mastery',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    description: 'The most challenging questions that test deep understanding.',
  },
};

export default function BatchTransition({
  completedBatch,
  nextBatch,
  knowledgeScore,
  wisdomScore,
  currentStreak,
  onContinue,
}: BatchTransitionProps) {
  const tier = tierInfo[nextBatch];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-950 flex items-center justify-center p-6"
    >
      <div className="max-w-lg w-full">
        {/* Batch complete badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
            <ArrowUp size={40} className="text-emerald-400" />
          </div>
        </motion.div>

        {/* Batch complete title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center font-serif text-3xl text-amber-50 mb-2"
        >
          Tier {completedBatch} Complete!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center font-mono text-slate-400 text-sm mb-8"
        >
          Advancing to Tier {nextBatch}: {tier.name}
        </motion.p>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="text-sky-400 text-2xl font-bold">{knowledgeScore}</div>
            <div className="text-slate-500 text-xs font-mono uppercase">Knowledge</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="text-amber-400 text-2xl font-bold">{wisdomScore}</div>
            <div className="text-slate-500 text-xs font-mono uppercase">Wisdom</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame size={20} className="text-orange-500" />
              <span className="text-orange-400 text-2xl font-bold">{currentStreak}</span>
            </div>
            <div className="text-slate-500 text-xs font-mono uppercase">Streak</div>
          </div>
        </motion.div>

        {/* Next tier preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${tier.bgColor} border ${tier.borderColor} rounded-xl p-4 mb-8`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className={tier.color} />
            <span className={`font-mono text-sm uppercase tracking-wider ${tier.color}`}>
              Tier {nextBatch}: {tier.name}
            </span>
          </div>
          <p className="text-slate-300 text-sm">{tier.description}</p>
        </motion.div>

        {/* Franklin message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <BenFranklinAvatar
            emotion="impressed"
            message={batchMessages[nextBatch]}
            showMessage={true}
            size="sm"
          />
        </motion.div>

        {/* Continue button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="w-full py-4 bg-amber-600 text-white rounded-xl font-mono text-sm uppercase tracking-widest hover:bg-amber-500 transition-colors"
        >
          Begin Tier {nextBatch}
        </motion.button>
      </div>
    </motion.div>
  );
}
