'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import { formatPercentage } from '@/lib/utils';

interface ChildProgress {
  id: string;
  name: string;
  avatar: string;
  totalXp: number;
  level: number;
  learningProfile: 'encyclopedist' | 'strategist' | 'balanced';
  weeklyStats: {
    sessionsCompleted: number;
    questionsAnswered: number;
    knowledgeAccuracy: number;
    wisdomAccuracy: number;
    averageStreak: number;
  };
  recentActivity: Array<{
    date: string;
    topic: string;
    score: number;
  }>;
}

const PROFILE_INFO = {
  encyclopedist: {
    name: 'Encyclopedist',
    icon: '📚',
    description: 'Excellent at memorizing facts but could use more practice with understanding cause and effect.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  strategist: {
    name: 'Strategist',
    icon: '🧠',
    description: 'Great at understanding the big picture but sometimes forgets specific names and dates.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  balanced: {
    name: 'Balanced Learner',
    icon: '⚖️',
    description: 'Well-rounded learner with good balance between factual knowledge and conceptual understanding.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
};

// Mock data for demonstration
const MOCK_CHILD: ChildProgress = {
  id: '1',
  name: 'Alex',
  avatar: '🧒',
  totalXp: 1250,
  level: 5,
  learningProfile: 'balanced',
  weeklyStats: {
    sessionsCompleted: 7,
    questionsAnswered: 85,
    knowledgeAccuracy: 0.78,
    wisdomAccuracy: 0.72,
    averageStreak: 4.2,
  },
  recentActivity: [
    { date: '2024-01-10', topic: 'American Revolution', score: 85 },
    { date: '2024-01-09', topic: 'Age of Exploration', score: 90 },
    { date: '2024-01-08', topic: 'The Acts', score: 75 },
  ],
};

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [selectedChild, setSelectedChild] = useState<ChildProgress>(MOCK_CHILD);

  const profile = PROFILE_INFO[selectedChild.learningProfile];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
          <div className="flex items-center gap-4">
            {isLoaded && user && (
              <span className="text-gray-600">
                Welcome, {user.firstName || 'Parent'}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Child Selector (for multiple children) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-6">
            <div className="text-5xl">{selectedChild.avatar}</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{selectedChild.name}</h2>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-primary-600 font-medium">
                  Level {selectedChild.level}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  {selectedChild.totalXp} XP Total
                </span>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Switch Child
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Stats Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                📊 This Week&apos;s Progress
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <span className="text-3xl font-bold text-primary-600">
                    {selectedChild.weeklyStats.sessionsCompleted}
                  </span>
                  <span className="text-sm text-gray-500 block">Sessions</span>
                </div>
                <div className="text-center">
                  <span className="text-3xl font-bold text-primary-600">
                    {selectedChild.weeklyStats.questionsAnswered}
                  </span>
                  <span className="text-sm text-gray-500 block">Questions</span>
                </div>
                <div className="text-center">
                  <span className="text-3xl font-bold text-orange-500">
                    {selectedChild.weeklyStats.averageStreak.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500 block">Avg Streak</span>
                </div>
                <div className="text-center">
                  <span className="text-3xl font-bold text-green-600">
                    {formatPercentage(
                      (selectedChild.weeklyStats.knowledgeAccuracy +
                        selectedChild.weeklyStats.wisdomAccuracy) /
                        2
                    )}
                  </span>
                  <span className="text-sm text-gray-500 block">Accuracy</span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4">
                <ProgressBar
                  value={Math.round(selectedChild.weeklyStats.knowledgeAccuracy * 100)}
                  max={100}
                  type="knowledge"
                  label={`Knowledge: ${formatPercentage(
                    selectedChild.weeklyStats.knowledgeAccuracy
                  )}`}
                />
                <ProgressBar
                  value={Math.round(selectedChild.weeklyStats.wisdomAccuracy * 100)}
                  max={100}
                  type="wisdom"
                  label={`Wisdom: ${formatPercentage(
                    selectedChild.weeklyStats.wisdomAccuracy
                  )}`}
                />
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                📅 Recent Sessions
              </h3>

              <div className="space-y-3">
                {selectedChild.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <span className="font-medium text-gray-900">
                        {activity.topic}
                      </span>
                      <span className="text-sm text-gray-500 block">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        activity.score >= 80
                          ? 'text-green-600'
                          : activity.score >= 60
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {activity.score}%
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`rounded-2xl shadow-lg p-6 ${profile.bg}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{profile.icon}</span>
                <div>
                  <h3 className={`text-lg font-bold ${profile.color}`}>
                    {profile.name}
                  </h3>
                  <span className="text-sm text-gray-500">Learning Profile</span>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {profile.description}
              </p>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                💡 Socrates&apos; Insights
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <span className="text-green-600 text-sm font-medium">
                    ✓ Strength
                  </span>
                  <p className="text-gray-700 text-sm mt-1">
                    Shows excellent recall of dates and key figures in American history.
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <span className="text-amber-600 text-sm font-medium">
                    ⚡ Opportunity
                  </span>
                  <p className="text-gray-700 text-sm mt-1">
                    Could benefit from more practice connecting causes and effects.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <span className="text-blue-600 text-sm font-medium">
                    📚 Suggestion
                  </span>
                  <p className="text-gray-700 text-sm mt-1">
                    Try the &quot;The Acts&quot; topic to strengthen understanding of colonial laws.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                ⚡ Quick Actions
              </h3>
              <div className="space-y-3">
                <Button variant="secondary" className="w-full justify-start">
                  📧 Email Weekly Report
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  🎯 Set Learning Goals
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  👨‍👩‍👧 Manage Children
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
