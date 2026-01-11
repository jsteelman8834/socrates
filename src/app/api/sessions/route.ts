import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';
import { z } from 'zod';

const startSessionSchema = z.object({
  topicId: z.string().uuid(),
});

// POST /api/sessions - Start a new learning session
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

    // Get student profile for starting tier
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('overall_rating')
      .eq('user_id', user.id)
      .single();

    // Calculate starting tier based on rating
    const rating = profile?.overall_rating || 1000;
    let startingTier = 1;
    if (rating >= 1200) startingTier = 3;
    else if (rating >= 1100) startingTier = 2;

    // Get topic info
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

    // Create the session
    const { data: session, error: sessionError } = await supabase
      .from('learning_sessions')
      .insert({
        student_id: user.id,
        topic_id: topicId,
        status: 'active',
        starting_tier: startingTier,
        hearts_remaining: 3,
        current_streak: 0,
        max_streak: 0,
        questions_attempted: 0,
        questions_correct: 0,
        knowledge_correct: 0,
        wisdom_correct: 0,
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

    // Generate greeting
    const greetings = [
      `Welcome, young historian! Today we explore ${topic.name}. Ready to discover?`,
      `Hello there! Let's dive into ${topic.name} together. Are you ready?`,
      `Greetings, curious learner! ${topic.name} awaits. Shall we begin?`,
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        topic: {
          id: topic.id,
          name: topic.name,
          slug: topic.slug,
          description: topic.description,
        },
        initialState: {
          sessionId: session.id,
          studentId: user.id,
          topicId: topic.id,
          status: 'active',
          currentTier: startingTier,
          currentStreak: 0,
          maxStreak: 0,
          heartsRemaining: 3,
          questionsAnswered: 0,
          questionsCorrect: 0,
          knowledgeCorrect: 0,
          wisdomCorrect: 0,
          totalXp: 0,
        },
        socratesGreeting: greeting,
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
