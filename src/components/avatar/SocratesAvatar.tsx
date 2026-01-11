'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { AvatarEmotion } from '@/types';

interface SocratesAvatarProps {
  emotion: AvatarEmotion;
  message?: string;
  showMessage?: boolean;
  avatarType?: 'owl' | 'scholar' | 'explorer';
}

const emotionEmojis: Record<AvatarEmotion, string> = {
  happy: '😊',
  encouraging: '💪',
  thinking: '🤔',
  curious: '🧐',
  celebrating: '🎉',
};

const emotionColors: Record<AvatarEmotion, string> = {
  happy: 'from-green-400 to-green-500',
  encouraging: 'from-blue-400 to-blue-500',
  thinking: 'from-purple-400 to-purple-500',
  curious: 'from-amber-400 to-amber-500',
  celebrating: 'from-pink-400 to-pink-500',
};

const avatarImages: Record<string, string> = {
  owl: '🦉',
  scholar: '👨‍🎓',
  explorer: '🧭',
};

export default function SocratesAvatar({
  emotion,
  message,
  showMessage = true,
  avatarType = 'owl',
}: SocratesAvatarProps) {
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
        className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${emotionColors[emotion]} shadow-lg flex items-center justify-center`}
        animate={{
          scale: emotion === 'celebrating' ? [1, 1.1, 1] : 1,
          rotate: emotion === 'thinking' ? [0, -5, 5, 0] : 0,
        }}
        transition={{
          duration: emotion === 'celebrating' ? 0.5 : 2,
          repeat: emotion === 'celebrating' || emotion === 'thinking' ? Infinity : 0,
          repeatType: 'reverse',
        }}
      >
        {/* Main Avatar */}
        <span className="text-5xl">{avatarImages[avatarType]}</span>

        {/* Emotion Badge */}
        <motion.div
          key={emotion}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-2xl"
        >
          {emotionEmojis[emotion]}
        </motion.div>
      </motion.div>

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
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45 shadow-md" />

            {/* Bubble content */}
            <div className="relative bg-white rounded-2xl shadow-lg p-4 z-10">
              <p className="text-gray-800 text-lg leading-relaxed">
                {displayedMessage}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-2 h-5 bg-primary-500 ml-1 align-middle"
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
