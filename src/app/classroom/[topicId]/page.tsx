'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSessionStore } from '@/store/sessionStore';
import SessionHeader from '@/components/classroom/SessionHeader';
import QuestionCard from '@/components/classroom/QuestionCard';
import FeedbackModal from '@/components/classroom/FeedbackModal';
import SessionSummary from '@/components/classroom/SessionSummary';
import SocratesAvatar from '@/components/avatar/SocratesAvatar';
import Button from '@/components/ui/Button';

interface ClassroomPageProps {
  params: { topicId: string };
}

export default function ClassroomPage({ params }: ClassroomPageProps) {
  const router = useRouter();
  const {
    status,
    currentQuestion,
    selectedOptionId,
    currentTier,
    currentStreak,
    maxStreak,
    heartsRemaining,
    questionsAnswered,
    knowledgeProgress,
    wisdomProgress,
    totalXp,
    feedback,
    tierChanged,
    tierDirection,
    sessionSummary,
    error,
    startSession,
    selectOption,
    submitAnswer,
    dismissFeedback,
    resetSession,
  } = useSessionStore();

  // Start session on mount
  useEffect(() => {
    startSession(params.topicId);

    return () => {
      // Clean up on unmount
      resetSession();
    };
  }, [params.topicId, startSession, resetSession]);

  // Handle play again
  const handlePlayAgain = () => {
    resetSession();
    startSession(params.topicId);
  };

  // Handle go home
  const handleGoHome = () => {
    resetSession();
    router.push('/');
  };

  // Show session summary
  if (status === 'summary' && sessionSummary) {
    return (
      <SessionSummary
        totalQuestions={sessionSummary.totalQuestions}
        correctAnswers={sessionSummary.correctAnswers}
        accuracy={sessionSummary.accuracy}
        knowledgeAccuracy={sessionSummary.knowledgeAccuracy}
        wisdomAccuracy={sessionSummary.wisdomAccuracy}
        maxStreak={sessionSummary.maxStreak}
        xpEarned={sessionSummary.xpEarned}
        sessionStatus={heartsRemaining <= 0 ? 'failed' : 'completed'}
        onPlayAgain={handlePlayAgain}
        onGoHome={handleGoHome}
      />
    );
  }

  // Show error state
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center"
        >
          <span className="text-6xl mb-4 block">😕</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || 'Something went wrong'}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleGoHome} variant="secondary">
              Go Home
            </Button>
            <Button onClick={() => startSession(params.topicId)}>
              Try Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show loading state
  if (status === 'loading' && !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <SocratesAvatar
            emotion="thinking"
            message="Getting your question ready..."
            showMessage={true}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Session Header */}
        <SessionHeader
          currentTier={currentTier}
          heartsRemaining={heartsRemaining}
          maxHearts={3}
          currentStreak={currentStreak}
          maxStreak={maxStreak}
          knowledgeProgress={knowledgeProgress}
          wisdomProgress={wisdomProgress}
          knowledgeGoal={7}
          wisdomGoal={8}
          questionsAnswered={questionsAnswered}
          totalQuestions={15}
          totalXp={totalXp}
        />

        {/* Main Content */}
        <div className="flex flex-col items-center gap-8">
          {/* Socrates Avatar */}
          <SocratesAvatar
            emotion="curious"
            showMessage={false}
          />

          {/* Question Card */}
          {currentQuestion && (
            <QuestionCard
              questionText={currentQuestion.questionText}
              questionType={currentQuestion.questionType}
              options={currentQuestion.options}
              selectedOptionId={selectedOptionId}
              onSelectOption={selectOption}
              disabled={status === 'loading' || status === 'feedback'}
            />
          )}

          {/* Submit Button */}
          {currentQuestion && (
            <Button
              onClick={submitAnswer}
              disabled={!selectedOptionId || status === 'loading'}
              loading={status === 'loading'}
              size="lg"
            >
              Submit Answer
            </Button>
          )}
        </div>

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={status === 'feedback'}
          feedback={feedback}
          onContinue={dismissFeedback}
          tierChanged={tierChanged}
          tierDirection={tierDirection}
          currentTier={currentTier}
        />
      </div>
    </div>
  );
}
