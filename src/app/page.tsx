'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import Button from '@/components/ui/Button';
import SocratesAvatar from '@/components/avatar/SocratesAvatar';

interface Topic {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  icon: string;
}

const TOPICS: Topic[] = [
  {
    id: 'age-of-exploration',
    name: 'Age of Exploration',
    description: 'Discover how brave explorers sailed across oceans to find new lands',
    questionCount: 25,
    icon: '🧭',
  },
  {
    id: 'american-revolution',
    name: 'American Revolution',
    description: 'Learn how the colonies fought for independence from Britain',
    questionCount: 30,
    icon: '🗽',
  },
  {
    id: 'the-acts',
    name: 'The Acts',
    description: 'Understand the laws that led to the birth of a nation',
    questionCount: 25,
    icon: '📜',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('Welcome, young historian!');

  useEffect(() => {
    if (isLoaded && user) {
      const firstName = user.firstName || 'Explorer';
      const hour = new Date().getHours();
      let timeGreeting = '';

      if (hour < 12) timeGreeting = 'Good morning';
      else if (hour < 18) timeGreeting = 'Good afternoon';
      else timeGreeting = 'Good evening';

      setGreeting(`${timeGreeting}, ${firstName}! Ready to explore history?`);
    }
  }, [isLoaded, user]);

  const handleStartSession = () => {
    if (selectedTopic) {
      router.push(`/classroom/${selectedTopic}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Virtual Socratic University
          </h1>
          <p className="text-xl text-gray-600">
            Learn 5th Grade American History the fun way!
          </p>
        </motion.div>

        {/* Avatar with greeting */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <SocratesAvatar
            emotion="happy"
            message={greeting}
            showMessage={true}
          />
        </motion.div>

        {/* Topic Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Choose Your Adventure
          </h2>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {TOPICS.map((topic, index) => (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTopic(topic.id)}
                className={`p-6 rounded-2xl text-left transition-all duration-200 ${
                  selectedTopic === topic.id
                    ? 'bg-primary-500 text-white shadow-lg ring-4 ring-primary-300'
                    : 'bg-white shadow-md hover:shadow-lg'
                }`}
              >
                <span className="text-4xl mb-3 block">{topic.icon}</span>
                <h3
                  className={`text-lg font-bold mb-2 ${
                    selectedTopic === topic.id ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {topic.name}
                </h3>
                <p
                  className={`text-sm mb-3 ${
                    selectedTopic === topic.id ? 'text-primary-100' : 'text-gray-600'
                  }`}
                >
                  {topic.description}
                </p>
                <span
                  className={`text-xs font-medium ${
                    selectedTopic === topic.id ? 'text-primary-200' : 'text-gray-400'
                  }`}
                >
                  {topic.questionCount} questions
                </span>
              </motion.button>
            ))}
          </div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center"
          >
            <Button
              onClick={handleStartSession}
              disabled={!selectedTopic}
              size="lg"
              className="px-12"
            >
              Start Learning!
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Preview (if user exists) */}
        {isLoaded && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
              Your Progress
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-3xl block mb-1">⭐</span>
                <span className="text-2xl font-bold text-primary-600">0</span>
                <span className="text-sm text-gray-500 block">Total XP</span>
              </div>
              <div>
                <span className="text-3xl block mb-1">🔥</span>
                <span className="text-2xl font-bold text-orange-500">0</span>
                <span className="text-sm text-gray-500 block">Best Streak</span>
              </div>
              <div>
                <span className="text-3xl block mb-1">📚</span>
                <span className="text-2xl font-bold text-blue-600">0</span>
                <span className="text-sm text-gray-500 block">Sessions</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-gray-500 text-sm">
        <p>
          &quot;Education is the kindling of a flame, not the filling of a vessel.&quot;
        </p>
        <p className="mt-1">— Socrates (attributed)</p>
      </footer>
    </div>
  );
}
