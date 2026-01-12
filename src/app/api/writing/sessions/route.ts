/**
 * POST /api/writing/sessions
 *
 * Start a new writing session with Shakespeare.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';
import { shakespeare } from '@/lib/ai/shakespeare-agent';
import { z } from 'zod';
import type { ChallengeLevel, WriterProfile, WritingPrompt } from '@/types/writing';

const startSessionSchema = z.object({
  promptId: z.string().uuid().optional(),
  challengeLevel: z.number().min(1).max(8).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = startSessionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: validation.error.message } },
        { status: 400 }
      );
    }

    const { promptId, challengeLevel: requestedLevel } = validation.data;
    const supabase = createAdminSupabaseClient();

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, display_name')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Get or create writer profile
    let { data: writerProfile } = await supabase
      .from('writer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!writerProfile) {
      const { data: newProfile } = await supabase
        .from('writer_profiles')
        .insert({ user_id: user.id })
        .select()
        .single();
      writerProfile = newProfile;
    }

    // Determine challenge level
    const challengeLevel = (requestedLevel || writerProfile?.challenge_level || 1) as ChallengeLevel;

    // Get a prompt - either specific or random for level
    const mapPrompt = (row: any): WritingPrompt => ({
      id: row.id,
      challengeLevel: row.challenge_level,
      title: row.title,
      promptText: row.prompt_text,
      promptType: row.prompt_type,
      genres: row.genres || [],
      scaffoldOptions: row.scaffold_options || [],
      successCriteria: row.success_criteria || [],
      estimatedMinutes: row.estimated_minutes || 10,
      isActive: row.is_active ?? true,
      createdAt: new Date(row.created_at),
    });

    let prompt: WritingPrompt | null = null;

    if (promptId) {
      const { data } = await supabase
        .from('writing_prompts')
        .select('*')
        .eq('id', promptId)
        .eq('is_active', true)
        .single();
      prompt = data ? mapPrompt(data) : null;
    }

    if (!prompt) {
      // Get random main challenge prompt for this level
      const { data: prompts } = await supabase
        .from('writing_prompts')
        .select('*')
        .eq('challenge_level', challengeLevel)
        .eq('prompt_type', 'main_challenge')
        .eq('is_active', true);

      if (prompts && prompts.length > 0) {
        prompt = mapPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
      }
    }

    if (!prompt) {
      return NextResponse.json(
        { error: { code: 'NO_PROMPT', message: 'No prompts available for this level' } },
        { status: 404 }
      );
    }

    // Get a warm-up prompt
    const { data: warmUpPrompts } = await supabase
      .from('writing_prompts')
      .select('*')
      .eq('prompt_type', 'warm_up')
      .eq('is_active', true);

    const warmUpPrompt =
      warmUpPrompts && warmUpPrompts.length > 0
        ? mapPrompt(warmUpPrompts[Math.floor(Math.random() * warmUpPrompts.length)])
        : null;

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('writing_sessions')
      .insert({
        student_id: user.id,
        challenge_level: challengeLevel,
        prompt_id: prompt.id,
        phase: 'warm_up',
        status: 'active',
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return NextResponse.json(
        { error: { code: 'SESSION_ERROR', message: 'Failed to create session' } },
        { status: 500 }
      );
    }

    // Generate greeting
    const profile: WriterProfile = {
      id: writerProfile.id,
      userId: writerProfile.user_id,
      interests: writerProfile.interests || ['comedy', 'fantasy'],
      preferredMode: writerProfile.preferred_mode || 'dialogue',
      strengths: writerProfile.strengths || [],
      growthAreas: writerProfile.growth_areas || [],
      challengeLevel: writerProfile.challenge_level || 1,
      writingStaminaMinutes: writerProfile.writing_stamina_minutes || 10,
      currentLearningGoals: writerProfile.current_learning_goals || [],
      completionRate: writerProfile.completion_rate || 0.5,
      revisionWillingness: writerProfile.revision_willingness || 0.5,
      creativeRiskScore: writerProfile.creative_risk_score || 0.5,
      totalStoriesWritten: writerProfile.total_stories_written || 0,
      totalWordsWritten: writerProfile.total_words_written || 0,
      createdAt: new Date(writerProfile.created_at),
      updatedAt: new Date(writerProfile.updated_at),
    };

    const greeting = await shakespeare.generateGreeting(profile, prompt);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        writerProfile: profile,
        mainPrompt: {
          id: prompt.id,
          title: prompt.title,
          text: prompt.promptText,
          challengeLevel: prompt.challengeLevel,
          estimatedMinutes: prompt.estimatedMinutes,
        },
        warmUpPrompt: warmUpPrompt
          ? {
              id: warmUpPrompt.id,
              title: warmUpPrompt.title,
              text: warmUpPrompt.promptText,
            }
          : null,
        shakespeareGreeting: greeting,
        phase: 'warm_up',
      },
    });
  } catch (error) {
    console.error('Error starting writing session:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to start session' } },
      { status: 500 }
    );
  }
}
