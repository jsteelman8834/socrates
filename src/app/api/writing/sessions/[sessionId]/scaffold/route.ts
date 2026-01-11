/**
 * POST /api/writing/sessions/:sessionId/scaffold
 * Get help from Shakespeare when stuck
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';
import { shakespeare } from '@/lib/ai/shakespeare-agent';
import { z } from 'zod';
import type { StuckType, WritingPrompt } from '@/types/writing';

const scaffoldSchema = z.object({
  stuckType: z.enum(['cant_start', 'stuck_middle', 'dont_know_ending', 'need_ideas']),
  currentContent: z.string().default(''),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { sessionId } = params;
    const body = await request.json();
    const validation = scaffoldSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: validation.error.message } },
        { status: 400 }
      );
    }

    const { stuckType, currentContent } = validation.data;
    const supabase = createAdminSupabaseClient();

    // Verify user owns this session
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Get session with prompt
    const { data: session } = await supabase
      .from('writing_sessions')
      .select('*, writing_prompts(*)')
      .eq('id', sessionId)
      .eq('student_id', user.id)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );
    }

    // Get the prompt
    const prompt: WritingPrompt = session.writing_prompts || {
      id: session.prompt_id,
      challengeLevel: session.challenge_level,
      title: 'Writing Challenge',
      promptText: 'Write a creative story.',
      promptType: 'main_challenge',
      genres: [],
      scaffoldOptions: [],
      successCriteria: [],
      estimatedMinutes: 10,
      isActive: true,
      createdAt: new Date(),
    };

    // Generate scaffold help
    const scaffold = await shakespeare.generateScaffold(
      stuckType as StuckType,
      prompt,
      currentContent
    );

    // Track scaffold usage in behavioral observations (for Aristotle analysis)
    await supabase.from('behavioral_observations').insert({
      session_id: sessionId,
      student_id: user.id,
      behavior_type: 'scaffold_usage',
      faculty_observed: 'imagination', // Scaffold usage indicates imagination/creativity needs support
      observation_data: {
        stuckType,
        contentLengthAtRequest: currentContent.length,
        scaffoldType: scaffold.scaffoldType,
      },
      behavioral_trait: stuckType === 'cant_start' ? 'needs_starter' : 'needs_direction',
      trait_strength: 0.6,
    }).catch((err) => {
      // Log but don't fail the request - observation is non-critical
      console.warn('Failed to record scaffold usage observation:', err);
    });

    return NextResponse.json({
      success: true,
      data: {
        scaffold: {
          scaffoldType: scaffold.scaffoldType,
          content: scaffold.content,
          shakespeareMessage: scaffold.shakespeareMessage,
          emotion: scaffold.emotion,
        },
      },
    });
  } catch (error) {
    console.error('Error generating scaffold:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to generate help' } },
      { status: 500 }
    );
  }
}
