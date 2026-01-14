'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { FranklinEmotion } from '@/types/franklin';

interface FranklinAvatarProps {
  emotion: FranklinEmotion;
  message?: string;
  showMessage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const emotionEmojis: Record<FranklinEmotion, string> = {
  welcoming: '👋',
  storytelling: '📖',
  thoughtful: '🤔',
  proud: '⭐',
  curious: '🧐',
  impressed: '👏',
  encouraging: '💪',
};

const emotionColors: Record<FranklinEmotion, string> = {
  welcoming: 'from-amber-400 to-amber-600',
  storytelling: 'from-slate-600 to-slate-800',
  thoughtful: 'from-emerald-400 to-emerald-600',
  proud: 'from-amber-500 to-amber-700',
  curious: 'from-sky-400 to-sky-600',
  impressed: 'from-violet-400 to-violet-600',
  encouraging: 'from-rose-400 to-rose-600',
};

const sizeClasses = {
  sm: 'w-16 h-16 text-3xl',
  md: 'w-24 h-24 text-5xl',
  lg: 'w-32 h-32 text-6xl',
};

const emotionBadgeSizes = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-10 h-10 text-2xl',
  lg: 'w-12 h-12 text-3xl',
};

export default function FranklinAvatar({
  emotion,
  message,
  showMessage = true,
  size = 'md',
}: FranklinAvatarProps) {
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
    }, 30);

    return () => clearInterval(timer);
  }, [message, showMessage]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Circle */}
      <motion.div
        className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br ${emotionColors[emotion]} shadow-lg flex items-center justify-center`}
        animate={{
          scale: emotion === 'impressed' ? [1, 1.1, 1] : 1,
          rotate: emotion === 'thoughtful' ? [0, -5, 5, 0] : 0,
        }}
        transition={{
          duration: emotion === 'impressed' ? 0.5 : 2,
          repeat: emotion === 'impressed' || emotion === 'thoughtful' ? Infinity : 0,
          repeatType: 'reverse',
        }}
      >
        {/* Franklin Character - Using colonial-era glasses emoji + mustache */}
        <div className="flex flex-col items-center">
          <span className={size === 'sm' ? 'text-2xl' : size === 'md' ? 'text-4xl' : 'text-5xl'}>
            👨‍🦳
          </span>
        </div>

        {/* Emotion Badge */}
        <motion.div
          key={emotion}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className={`absolute -bottom-1 -right-1 ${emotionBadgeSizes[size]} bg-white rounded-full shadow-md flex items-center justify-center`}
        >
          {emotionEmojis[emotion]}
        </motion.div>
      </motion.div>

      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        {showMessage && message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-md"
          >
            {/* Speech Bubble with dark slate theme */}
            <div className="bg-slate-800 border-2 border-amber-500 rounded-xl px-6 py-4 shadow-xl">
              <p className="text-amber-50 text-sm leading-relaxed font-serif">
                {displayedMessage}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                    className="inline-block ml-1"
                  >
                    ▊
                  </motion.span>
                )}
              </p>
            </div>

            {/* Speech Bubble Pointer */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <div className="w-4 h-4 bg-slate-800 border-t-2 border-l-2 border-amber-500 transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optional: Print Shop Decoration */}
      {size === 'lg' && (
        <div className="flex items-center gap-2 text-slate-600 text-xs font-mono">
          <span>📰</span>
          <span>FRANKLIN'S PRINT SHOP</span>
          <span>🖋️</span>
        </div>
      )}
    </div>
  );
}
