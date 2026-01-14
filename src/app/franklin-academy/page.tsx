'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFranklinAcademyStore } from '@/store/franklinAcademyStore';
import FranklinAvatar from '@/components/franklin/FranklinAvatar';
import { SKILL_LEVELS } from '@/types/franklin';

export default function FranklinAcademyPage() {
  const {
    enrollmentId,
    currentWeek,
    currentDay,
    completedDays,
    skills,
    sessionStatus,
    error,
    startAcademy,
  } = useFranklinAcademyStore();

  // Auto-enroll on page load
  useEffect(() => {
    if (!enrollmentId && sessionStatus === 'idle') {
      startAcademy();
    }
  }, [enrollmentId, sessionStatus, startAcademy]);

  // Get skill level name
  const getSkillLevel = (points: number) => {
    const level = SKILL_LEVELS.findLast((l) => points >= l.minPoints);
    return level || SKILL_LEVELS[0];
  };

  // Loading state
  if (sessionStatus === 'loading' && !enrollmentId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <FranklinAvatar
            emotion="welcoming"
            message="Welcome to my print shop! Let me prepare your apprenticeship..."
            showMessage={true}
            size="lg"
          />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const isSupabaseError = error.includes('supabase') || error.includes('UNAUTHORIZED');

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 border-2 border-rose-500 rounded-2xl shadow-2xl p-8 max-w-2xl text-center"
        >
          <span className="text-6xl mb-4 block">😕</span>
          <h2 className="text-2xl font-serif font-bold text-amber-50 mb-2">
            A Complication Arises
          </h2>
          <p className="text-slate-300 mb-4">{error}</p>

          {isSupabaseError && (
            <div className="bg-slate-900 border border-amber-600 rounded-lg p-4 mb-6 text-left">
              <p className="text-amber-400 font-mono text-sm mb-2">🔧 Configuration Help:</p>
              <ol className="text-slate-300 text-sm space-y-2 list-decimal list-inside">
                <li>Check your <code className="bg-slate-800 px-1 rounded">.env.local</code> file</li>
                <li>Set <code className="bg-slate-800 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> to your project URL</li>
                <li>Set <code className="bg-slate-800 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your anon key</li>
                <li>Set <code className="bg-slate-800 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to your service role key</li>
                <li>Apply the database migration from <code className="bg-slate-800 px-1 rounded">supabase/migrations/009_franklin_academy.sql</code></li>
                <li>Restart the dev server</li>
              </ol>
            </div>
          )}

          <button
            onClick={() => startAcademy()}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-amber-900/30 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold text-amber-50 mb-1">
                Franklin's Grandson Academy
              </h1>
              <p className="text-slate-400 font-mono text-sm uppercase tracking-wide">
                📰 Philadelphia Print Shop • 1763-1775
              </p>
            </div>
            <FranklinAvatar emotion="welcoming" showMessage={false} size="sm" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <FranklinAvatar
            emotion="welcoming"
            message="Good morrow, young apprentice! Welcome to my print shop. Together we shall explore the years before the Revolution - a time of tension, debate, and fateful choices."
            showMessage={true}
            size="lg"
          />
        </motion.section>

        {/* Skills Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-serif font-bold text-amber-50 mb-6 text-center">
            Your Apprenticeship Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(skills).map(([skill, points]) => {
              const level = getSkillLevel(points);
              const progress = (points / 750) * 100; // 750 max points

              return (
                <motion.div
                  key={skill}
                  whileHover={{ scale: 1.05 }}
                  className="bg-slate-800 border-2 border-slate-700 rounded-xl p-6 shadow-xl hover:border-amber-600 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-mono text-amber-400 capitalize">{skill}</h3>
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                      {level.name}
                    </span>
                  </div>
                  <div className="relative h-3 bg-slate-900 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 to-amber-400"
                    />
                  </div>
                  <p className="text-sm text-slate-400">{points} / 750 points</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Journey Progress */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-serif font-bold text-amber-50 mb-6 text-center">
            Your Journey Through History
          </h2>

          {/* Week Grid */}
          <div className="space-y-8">
            {[1, 2, 3].map((week) => (
              <div key={week} className="bg-slate-800 border-2 border-slate-700 rounded-xl p-6 shadow-xl">
                <h3 className="text-xl font-serif font-bold text-amber-400 mb-4">
                  Week {week}: {week === 1 && 'The Seeds of Discord (1763-1767)'}
                  {week === 2 && 'Tension Rising (1768-1773)'}
                  {week === 3 && 'The Breaking Point (1774-1775)'}
                </h3>

                <div className="grid grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((dayInWeek) => {
                    const day = (week - 1) * 5 + dayInWeek;
                    const isCompleted = completedDays.includes(day);
                    const isCurrent = day === currentDay;
                    const isLocked = day > currentDay;

                    return (
                      <motion.button
                        key={day}
                        whileHover={!isLocked ? { scale: 1.05 } : {}}
                        whileTap={!isLocked ? { scale: 0.95 } : {}}
                        disabled={isLocked}
                        onClick={() => {
                          if (!isLocked) {
                            // TODO: Navigate to day session
                            window.location.href = `/franklin-academy/week-${week}/day-${day}`;
                          }
                        }}
                        className={`
                          relative p-6 rounded-lg border-2 transition-all
                          ${
                            isCompleted
                              ? 'bg-emerald-900/30 border-emerald-600 text-emerald-400'
                              : isCurrent
                                ? 'bg-amber-900/30 border-amber-600 text-amber-400 animate-pulse'
                                : isLocked
                                  ? 'bg-slate-900 border-slate-700 text-slate-600 cursor-not-allowed'
                                  : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-amber-500'
                          }
                        `}
                      >
                        <div className="text-3xl mb-2">
                          {isCompleted ? '✓' : isLocked ? '🔒' : day}
                        </div>
                        <div className="text-xs font-mono uppercase">Day {day}</div>
                        {isCurrent && !isCompleted && (
                          <div className="absolute -top-2 -right-2 bg-amber-600 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
                            START
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Capstone Project (unlocked after Day 14) */}
        {completedDays.length >= 14 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-amber-900/30 to-slate-800 border-2 border-amber-600 rounded-xl p-8 shadow-2xl text-center">
              <h2 className="text-3xl font-serif font-bold text-amber-50 mb-4">
                📰 Final Project: Your Pre-Revolution Newspaper
              </h2>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                You've witnessed the events that led to the American Revolution. Now it's time to
                tell the story through your own newspaper - headlines, timeline, and editorial.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  window.location.href = '/franklin-academy/newspaper';
                }}
                className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold text-lg rounded-lg transition-colors shadow-lg"
              >
                Create Your Newspaper
              </motion.button>
            </div>
          </motion.section>
        )}

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-slate-500 text-sm font-mono"
        >
          <p>"An investment in knowledge pays the best interest."</p>
          <p className="mt-2">— Benjamin Franklin, Poor Richard's Almanack</p>
        </motion.div>
      </main>
    </div>
  );
}
