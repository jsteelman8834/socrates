'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { FranklinEmotion } from '@/store/previewSessionStore';

interface BenFranklinAvatarProps {
  emotion: FranklinEmotion;
  message?: string;
  showMessage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const emotionBadges: Record<FranklinEmotion, string> = {
  welcoming: '👋',
  encouraging: '💪',
  delighted: '✨',
  impressed: '🌟',
  contemplative: '🤔',
  proud: '🎓',
};

const emotionGlows: Record<FranklinEmotion, string> = {
  welcoming: 'shadow-amber-500/30',
  encouraging: 'shadow-emerald-500/30',
  delighted: 'shadow-amber-400/40',
  impressed: 'shadow-amber-300/50',
  contemplative: 'shadow-violet-500/30',
  proud: 'shadow-amber-500/40',
};

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

export default function BenFranklinAvatar({
  emotion,
  message,
  showMessage = true,
  size = 'md',
}: BenFranklinAvatarProps) {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Typewriter effect for the message
  useEffect(() => {
    if (!message || !showMessage) {
      setDisplayedMessage('');
      return;
    }

    setIsTyping(true);
    setDisplayedMessage('');

    let index = 0;
    const timer = setInterval(() => {
      if (index < message.length) {
        setDisplayedMessage(message.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [message, showMessage]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Circle with Portrait */}
      <motion.div
        className={`relative ${sizeClasses[size]} rounded-full shadow-lg ${emotionGlows[emotion]} overflow-hidden`}
        animate={{
          scale: emotion === 'delighted' || emotion === 'impressed' ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: emotion === 'delighted' || emotion === 'impressed' ? 0.6 : 0,
          repeat: emotion === 'delighted' || emotion === 'impressed' ? 2 : 0,
        }}
      >
        {/* Animated glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 animate-pulse" />

        {/* Portrait frame */}
        <div className="relative w-full h-full rounded-full border-2 border-amber-900/50 overflow-hidden bg-slate-900">
          {/* Placeholder until portrait asset is added */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <span className="text-4xl">🎩</span>
          </div>
          {/* Uncomment when portrait is added:
          <Image
            src="/images/ben-franklin-portrait.png"
            alt="Benjamin Franklin"
            fill
            className="object-cover"
          />
          */}
        </div>

        {/* Emotion Badge */}
        <motion.div
          key={emotion}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-950 border border-amber-500/50 rounded-full shadow-md flex items-center justify-center text-lg"
        >
          {emotionBadges[emotion]}
        </motion.div>
      </motion.div>

      {/* Name badge */}
      <div className="px-3 py-1 bg-slate-950 border border-amber-500/30 rounded-lg">
        <span className="font-mono text-amber-400 text-xs tracking-widest uppercase">
          Benjamin Franklin
        </span>
      </div>

      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        {showMessage && message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="relative max-w-md"
          >
            {/* Bubble pointer */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 border-l border-t border-amber-500/30 transform rotate-45" />

            {/* Bubble content */}
            <div className="relative bg-slate-800 border border-amber-500/30 rounded-2xl shadow-lg p-4 z-10">
              <p className="text-amber-50 text-base leading-relaxed font-serif">
                {displayedMessage}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-2 h-5 bg-amber-500 ml-1 align-middle"
                  />
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
