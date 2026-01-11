import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';
import { getAgentForSubject, getAgentInfo } from '@/lib/agents';
import { z } from 'zod';

const startSessionSchema = z.object({
  topicId: z.string(),
});

// POST /api/sessions - Start a new learning session
// Supports both history (Socrates) and math (Pythagoras) subjects
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { topicId } = startSessionSchema.parse(body);

    const supabase = createAdminSupabaseClient();

    // Get user from our database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, display_name')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Get topic info (includes subject)
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .single();

    if (topicError || !topic) {
      return NextResponse.json(
        { error: { code: 'TOPIC_NOT_FOUND', message: 'Topic not found' } },
        { status: 404 }
      );
    }

    // Determine subject and agent
    const subject = topic.subject || 'history';
    const agent = getAgentForSubject(subject as 'history' | 'math');
    const agentInfo = getAgentInfo(agent);

    // Get student profile for starting tier
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('overall_rating, math_fluency_rating, math_concept_rating')
      .eq('user_id', user.id)
      .single();

    // Calculate starting tier based on subject-specific rating
    let rating = 1000;
    if (subject === 'math') {
      rating = Math.round(
        ((profile?.math_fluency_rating || 1000) +
          (profile?.math_concept_rating || 1000)) /
          2
      );
    } else {
      rating = profile?.overall_rating || 1000;
    }

    let startingTier = 1;
    if (rating >= 1200) startingTier = 3;
    else if (rating >= 1100) startingTier = 2;

    // Create the session with subject and agent info
    const { data: session, error: sessionError } = await supabase
      .from('learning_sessions')
      .insert({
        student_id: user.id,
        topic_id: topicId,
        subject: subject,
        agent: agent,
        status: 'active',
        starting_tier: startingTier,
        hearts_remaining: 3,
        current_streak: 0,
        max_streak: 0,
        questions_attempted: 0,
        questions_correct: 0,
        // History-specific
        knowledge_correct: 0,
        wisdom_correct: 0,
        // Math-specific
        fluency_correct: 0,
        concept_correct: 0,
        problem_solving_correct: 0,
        max_tier_reached: startingTier,
        xp_earned: 0,
        rating_change: 0,
        asked_question_ids: [],
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json(
        { error: { code: 'SESSION_ERROR', message: 'Failed to create session' } },
        { status: 500 }
      );
    }

    // Generate subject-appropriate greeting
    const greeting = generateGreeting(agent, topic.name, user.display_name);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        topic: {
          id: topic.id,
          name: topic.name,
          slug: topic.slug,
          description: topic.description,
          subject: subject,
          domain: topic.domain,
        },
        subject,
        agent,
        agentInfo,
        initialState: {
          sessionId: session.id,
          studentId: user.id,
          topicId: topic.id,
          subject: subject,
          status: 'active',
          currentTier: startingTier,
          currentStreak: 0,
          maxStreak: 0,
          heartsRemaining: 3,
          questionsAnswered: 0,
          questionsCorrect: 0,
          // Track both for flexibility
          knowledgeCorrect: 0,
          wisdomCorrect: 0,
          fluencyCorrect: 0,
          conceptCorrect: 0,
          problemSolvingCorrect: 0,
          totalXp: 0,
        },
        greeting,
      },
    });
  } catch (error) {
    console.error('Session API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

/**
 * Generate a greeting appropriate to the agent
 */
function generateGreeting(
  agent: 'socrates' | 'pythagoras',
  topicName: string,
  studentName: string
): string {
  if (agent === 'pythagoras') {
    const greetings = [
      `Welcome, ${studentName}! Today we explore the beautiful patterns in ${topicName}. Every number has a story to tell!`,
      `Greetings, young mathematician! ${topicName} is full of hidden patterns. Ready to discover them?`,
      `Hello, ${studentName}! Did you know that ${topicName} contains secrets of the universe? Let's find them together!`,
      `Welcome! In ${topicName}, we'll see that mathematics is not just numbers - it's the language of patterns. Shall we begin?`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  } else {
    // Socrates (history)
    const greetings = [
      `Welcome, ${studentName}! Today we explore ${topicName}. Ready to discover the past?`,
      `Hello, young historian! Let's dive into ${topicName} together. Are you ready?`,
      `Greetings, curious learner! ${topicName} awaits. Shall we begin our journey through time?`,
      `Welcome! The stories of ${topicName} are waiting to be discovered. Let's think together!`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
}
