'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Lightbulb, Flame, Trophy, Calculator, Feather, GraduationCap, ArrowRight } from 'lucide-react';
import BenFranklinAvatar from './BenFranklinAvatar';

interface PreviewSummaryProps {
  knowledgeCorrect: number;
  knowledgeTotal: number;
  wisdomCorrect: number;
  wisdomTotal: number;
  maxStreak: number;
  totalQuestions: number;
  onTryAgain: () => void;
}

function getCognitiveInsights(
  knowledgeCorrect: number,
  knowledgeTotal: number,
  wisdomCorrect: number,
  wisdomTotal: number
): { profile: string; insights: string[]; franklinMessage: string } {
  const knowledgePercent = knowledgeTotal > 0 ? (knowledgeCorrect / knowledgeTotal) * 100 : 0;
  const wisdomPercent = wisdomTotal > 0 ? (wisdomCorrect / wisdomTotal) * 100 : 0;
  const overallPercent = ((knowledgeCorrect + wisdomCorrect) / (knowledgeTotal + wisdomTotal)) * 100;

  if (knowledgePercent > wisdomPercent + 20) {
    return {
      profile: 'The Encyclopedist',
      insights: [
        'Strong foundation in factual knowledge',
        'Opportunity to develop analytical reasoning',
        'Consider exploring "why" behind the facts',
      ],
      franklinMessage:
        "Splendid! You possess a sharp memory for facts, much like my own catalog of inventions. Now let us hone your reasoning - for 'an investment in knowledge pays the best interest' only when wisdom guides its use. Join us to develop both faculties!",
    };
  } else if (wisdomPercent > knowledgePercent + 20) {
    return {
      profile: 'The Philosopher',
      insights: [
        'Strong analytical and reasoning skills',
        'Opportunity to solidify foundational facts',
        'Natural ability to understand deeper concepts',
      ],
      franklinMessage:
        "Most curious! You think like a natural philosopher - always seeking to understand the deeper 'why.' With a bit more attention to the foundational facts, you'll be unstoppable. Join us to build upon this excellent foundation!",
    };
  } else if (overallPercent >= 80) {
    return {
      profile: 'The Scholar',
      insights: [
        'Excellent balance of knowledge and wisdom',
        'Strong performance across question types',
        'Ready for advanced challenges',
      ],
      franklinMessage:
        "Capital! Truly capital! You demonstrate the balanced mind I so admire - equal parts fact and reason. You are precisely the kind of student who thrives in our Socratic approach. I do hope you'll continue this journey with us!",
    };
  } else if (overallPercent >= 60) {
    return {
      profile: 'The Apprentice',
      insights: [
        'Solid foundation to build upon',
        'Room for growth in both areas',
        'Shows promise with more practice',
      ],
      franklinMessage:
        "Well begun is half done, as they say! You show genuine promise. With consistent practice and the right guidance, I have no doubt you'll excel. Our curriculum is designed precisely for minds like yours - eager to grow!",
    };
  } else {
    return {
      profile: 'The Explorer',
      insights: [
        'Beginning your learning journey',
        'Many exciting discoveries ahead',
        'Every expert was once a beginner',
      ],
      franklinMessage:
        "Fear not, young explorer! I myself failed many times before succeeding with my kite experiment. Every master was once a disaster. Our Socratic method is designed to meet you where you are and guide you forward. Join us!",
    };
  }
}

const subjectPreviews = [
  {
    name: 'Mathematics',
    icon: Calculator,
    guide: 'Pythagoras',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'Discover patterns and master problem-solving with the father of numbers.',
  },
  {
    name: 'Creative Writing',
    icon: Feather,
    guide: 'Shakespeare',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    description: 'Craft compelling stories and find your unique voice with the Bard.',
  },
  {
    name: 'More History',
    icon: GraduationCap,
    guide: 'Socrates',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    description: 'Continue your journey through time with the original questioner.',
  },
];

export default function PreviewSummary({
  knowledgeCorrect,
  knowledgeTotal,
  wisdomCorrect,
  wisdomTotal,
  maxStreak,
  totalQuestions,
  onTryAgain,
}: PreviewSummaryProps) {
  const totalCorrect = knowledgeCorrect + wisdomCorrect;
  const knowledgePercent = knowledgeTotal > 0 ? Math.round((knowledgeCorrect / knowledgeTotal) * 100) : 0;
  const wisdomPercent = wisdomTotal > 0 ? Math.round((wisdomCorrect / wisdomTotal) * 100) : 0;
  const overallPercent = Math.round((totalCorrect / totalQuestions) * 100);

  const { profile, insights, franklinMessage } = getCognitiveInsights(
    knowledgeCorrect,
    knowledgeTotal,
    wisdomCorrect,
    wisdomTotal
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-950 py-12 px-6"
    >
      <div className="max-w-2xl mx-auto">
        {/* Trophy header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
            <Trophy size={40} className="text-amber-400" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center font-serif text-3xl text-amber-50 mb-2"
        >
          Preview Complete!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center font-mono text-slate-400 text-sm mb-8"
        >
          {totalCorrect} of {totalQuestions} questions answered correctly
        </motion.p>

        {/* Score cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {/* Knowledge */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-sky-400" />
              <span className="font-mono text-xs text-slate-400 uppercase">Knowledge</span>
            </div>
            <div className="text-sky-400 text-3xl font-bold">{knowledgePercent}%</div>
            <div className="text-slate-500 text-xs">
              {knowledgeCorrect}/{knowledgeTotal} correct
            </div>
          </div>

          {/* Wisdom */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={16} className="text-amber-400" />
              <span className="font-mono text-xs text-slate-400 uppercase">Wisdom</span>
            </div>
            <div className="text-amber-400 text-3xl font-bold">{wisdomPercent}%</div>
            <div className="text-slate-500 text-xs">
              {wisdomCorrect}/{wisdomTotal} correct
            </div>
          </div>

          {/* Best Streak */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-orange-400" />
              <span className="font-mono text-xs text-slate-400 uppercase">Best Streak</span>
            </div>
            <div className="text-orange-400 text-3xl font-bold">{maxStreak}</div>
            <div className="text-slate-500 text-xs">in a row</div>
          </div>
        </motion.div>

        {/* Learning Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-8"
        >
          <h3 className="font-serif text-xl text-amber-400 mb-4">
            Your Learning Profile: {profile}
          </h3>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-slate-300 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Franklin's message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <BenFranklinAvatar
            emotion="proud"
            message={franklinMessage}
            showMessage={true}
            size="sm"
          />
        </motion.div>

        {/* Subject previews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <h3 className="font-mono text-xs text-slate-400 uppercase tracking-wider mb-4 text-center">
            Explore More Subjects
          </h3>
          <div className="grid gap-3">
            {subjectPreviews.map((subject) => (
              <div
                key={subject.name}
                className={`${subject.bgColor} border ${subject.borderColor} rounded-xl p-4 flex items-center gap-4`}
              >
                <div className={`w-12 h-12 rounded-xl bg-slate-900/50 flex items-center justify-center`}>
                  <subject.icon size={24} className={subject.color} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-serif text-lg ${subject.color}`}>{subject.name}</span>
                    <span className="font-mono text-xs text-slate-500">with {subject.guide}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{subject.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <Link href="/sign-up" className="block">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-amber-600 text-white rounded-xl font-mono text-sm uppercase tracking-widest hover:bg-amber-500 transition-colors flex items-center justify-center gap-2"
            >
              Begin Your Journey <ArrowRight size={18} />
            </motion.button>
          </Link>

          <button
            onClick={onTryAgain}
            className="w-full py-4 bg-slate-800 text-slate-300 rounded-xl font-mono text-sm uppercase tracking-widest hover:bg-slate-700 transition-colors border border-slate-700"
          >
            Try Again
          </button>

          <Link href="/" className="block">
            <button className="w-full py-3 text-slate-500 font-mono text-xs uppercase tracking-widest hover:text-slate-400 transition-colors">
              Return to Home
            </button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
