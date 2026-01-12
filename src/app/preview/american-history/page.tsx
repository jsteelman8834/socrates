'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { usePreviewSessionStore } from '@/store/previewSessionStore';
import type { PreviewQuestion } from '@/store/previewSessionStore';
import BenFranklinAvatar from '@/components/preview/BenFranklinAvatar';
import PreviewHeader from '@/components/preview/PreviewHeader';
import PreviewQuestionCard from '@/components/preview/PreviewQuestionCard';
import PreviewFeedbackModal from '@/components/preview/PreviewFeedbackModal';
import BatchTransition from '@/components/preview/BatchTransition';
import PreviewSummary from '@/components/preview/PreviewSummary';

// Import question data
import questionData from '@/data/preview-american-history.json';

// Map JSON questions to PreviewQuestion type
function getQuestionForIndex(index: number, batch: 1 | 2 | 3): PreviewQuestion {
  const question = questionData.questions[index];
  return {
    id: question.id,
    questionText: question.questionText,
    questionType: question.questionType as 'knowledge' | 'wisdom',
    topicLabel: question.topicLabel,
    options: question.options.map((opt) => ({
      id: opt.id,
      label: opt.label,
      text: opt.text,
      isCorrect: opt.isCorrect,
      distractorType: opt.distractorType,
    })),
    correctOptionId: question.correctOptionId,
    answerExplanation: question.answerExplanation,
    mnemonics: question.mnemonics,
  };
}

export default function AmericanHistoryPreviewPage() {
  const {
    status,
    currentBatch,
    currentQuestionIndex,
    currentQuestion,
    selectedOptionId,
    currentStreak,
    maxStreak,
    heartsRemaining,
    knowledgeCorrect,
    knowledgeTotal,
    wisdomCorrect,
    wisdomTotal,
    feedback,
    startPreview,
    loadQuestion,
    selectOption,
    submitAnswer,
    dismissFeedback,
    nextBatch,
    resetPreview,
  } = usePreviewSessionStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load question when index changes
  useEffect(() => {
    if (status === 'active' && currentQuestionIndex < 15) {
      const question = getQuestionForIndex(currentQuestionIndex, currentBatch);
      loadQuestion(question);
    }
  }, [status, currentQuestionIndex, currentBatch, loadQuestion]);

  // Calculate progress percentages
  const knowledgeProgress = knowledgeTotal > 0 ? (knowledgeCorrect / knowledgeTotal) * 100 : 0;
  const wisdomProgress = wisdomTotal > 0 ? (wisdomCorrect / wisdomTotal) * 100 : 0;
  const questionInBatch = currentQuestionIndex % 5;

  const handleSubmit = async () => {
    if (!selectedOptionId) return;
    setIsSubmitting(true);
    try {
      submitAnswer();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismissFeedback = () => {
    dismissFeedback();
  };

  const handleNextBatch = () => {
    nextBatch();
  };

  const handleTryAgain = () => {
    resetPreview();
  };

  // Intro screen
  if (status === 'intro') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Back link */}
        <div className="p-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors font-mono text-sm"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        {/* Intro content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg w-full text-center"
          >
            {/* Decorative sparkle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="flex justify-center mb-8"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                <Sparkles size={32} className="text-amber-400" />
              </div>
            </motion.div>

            <h1 className="font-serif text-4xl text-amber-50 mb-4">
              American History Preview
            </h1>

            <p className="font-mono text-slate-400 text-sm mb-8 leading-relaxed">
              Experience the Socratic method with Benjamin Franklin as your guide.
              15 questions across 3 difficulty tiers. No account required.
            </p>

            {/* Franklin greeting */}
            <div className="mb-8">
              <BenFranklinAvatar
                emotion="welcoming"
                message="Greetings, young scholar! I am Benjamin Franklin, and I shall be your guide through the annals of American History. Let us discover together what you know - and more importantly, how you think. Shall we begin?"
                showMessage={true}
                size="lg"
              />
            </div>

            {/* Preview details */}
            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                <div className="text-amber-400 font-bold text-xl">15</div>
                <div className="text-slate-500 text-xs font-mono uppercase">Questions</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                <div className="text-amber-400 font-bold text-xl">3</div>
                <div className="text-slate-500 text-xs font-mono uppercase">Tiers</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                <div className="text-amber-400 font-bold text-xl">~10</div>
                <div className="text-slate-500 text-xs font-mono uppercase">Minutes</div>
              </div>
            </div>

            {/* Start button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startPreview()}
              className="w-full py-4 bg-amber-600 text-white rounded-xl font-mono text-sm uppercase tracking-widest hover:bg-amber-500 transition-colors"
            >
              Begin Preview
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Batch transition screen
  if (status === 'batch-transition') {
    return (
      <BatchTransition
        completedBatch={currentBatch as 1 | 2}
        nextBatch={(currentBatch + 1) as 2 | 3}
        knowledgeScore={knowledgeCorrect}
        wisdomScore={wisdomCorrect}
        currentStreak={currentStreak}
        onContinue={handleNextBatch}
      />
    );
  }

  // Summary screen
  if (status === 'summary') {
    return (
      <PreviewSummary
        knowledgeCorrect={knowledgeCorrect}
        knowledgeTotal={knowledgeTotal}
        wisdomCorrect={wisdomCorrect}
        wisdomTotal={wisdomTotal}
        maxStreak={maxStreak}
        totalQuestions={15}
        onTryAgain={handleTryAgain}
      />
    );
  }

  // Active quiz state
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <PreviewHeader
        currentBatch={currentBatch}
        questionInBatch={questionInBatch}
        heartsRemaining={heartsRemaining}
        currentStreak={currentStreak}
        knowledgeProgress={knowledgeProgress}
        wisdomProgress={wisdomProgress}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <PreviewQuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              selectedOptionId={selectedOptionId}
              onSelectOption={selectOption}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Feedback modal */}
      <PreviewFeedbackModal
        feedback={feedback}
        onDismiss={handleDismissFeedback}
      />
    </div>
  );
}
