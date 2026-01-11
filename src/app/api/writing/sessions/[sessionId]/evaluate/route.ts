/**
 * POST /api/writing/sessions/:sessionId/evaluate
 * Evaluate a draft and get Shakespeare's Director's Notes feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';
import { shakespeare } from '@/lib/ai/shakespeare-agent';
import { z } from 'zod';
import type { ChallengeLevel, WritingPrompt } from '@/types/writing';

const evaluateSchema = z.object({
  draftId: z.string().uuid(),
  requestedFeedbackType: z.enum(['quick', 'full']).default('full'),
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
    const validation = evaluateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: validation.error.message } },
        { status: 400 }
      );
    }

    const { draftId, requestedFeedbackType } = validation.data;
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

    // Get the draft
    const { data: draft } = await supabase
      .from('story_drafts')
      .select('*')
      .eq('id', draftId)
      .eq('session_id', sessionId)
      .single();

    if (!draft) {
      return NextResponse.json(
        { error: { code: 'DRAFT_NOT_FOUND', message: 'Draft not found' } },
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

    // Run evaluation
    const evaluation = await shakespeare.evaluateDraft(
      draft.content,
      prompt,
      session.challenge_level as ChallengeLevel
    );

    // Store rubric scores
    const { data: rubricScore } = await supabase
      .from('rubric_scores')
      .insert({
        draft_id: draftId,
        character_want: evaluation.storyPower.characterWant,
        obstacle: evaluation.storyPower.obstacle,
        stakes: evaluation.storyPower.stakes,
        voice: evaluation.storyPower.voice,
        memorable_moment: evaluation.storyPower.memorableMoment,
        clarity: evaluation.craftGrowth.clarity,
        concrete_details: evaluation.craftGrowth.concreteDetails,
        sentence_control: evaluation.craftGrowth.sentenceControl,
        sentence_variety: evaluation.craftGrowth.sentenceVariety,
        evaluation_confidence: evaluation.confidence,
        feedback_data: {
          detectedElements: evaluation.detectedElements,
          directorsNotes: evaluation.directorsNotes,
        },
      })
      .select()
      .single();

    // Store feedback
    await supabase.from('shakespeare_feedback').insert([
      {
        draft_id: draftId,
        rubric_score_id: rubricScore?.id,
        feedback_type: 'win',
        feedback_text: evaluation.directorsNotes.win.explanation,
        emotion: evaluation.directorsNotes.emotion,
        quote_from_work: evaluation.directorsNotes.win.quote,
      },
      {
        draft_id: draftId,
        rubric_score_id: rubricScore?.id,
        feedback_type: 'grow',
        feedback_text: evaluation.directorsNotes.grow.suggestion,
        emotion: evaluation.directorsNotes.emotion,
        example_rewrite: evaluation.directorsNotes.grow.example,
      },
    ]);

    // Update draft with detected elements
    await supabase
      .from('story_drafts')
      .update({ detected_elements: evaluation.detectedElements })
      .eq('id', draftId);

    // Calculate XP
    const wordCount = draft.word_count || 0;
    const baseXP = Math.floor(wordCount / 10) * 5;
    const qualityBonus = Math.floor(evaluation.storyPower.average * 10);
    const xpEarned = baseXP + qualityBonus;

    // Update session XP
    await supabase
      .from('writing_sessions')
      .update({ xp_earned: (session.xp_earned || 0) + xpEarned })
      .eq('id', sessionId);

    // Determine if challenge level should change
    let challengeLevelChange: number | undefined;
    if (
      evaluation.challengeLevelAppropriate &&
      evaluation.storyPower.average >= 4 &&
      session.challenge_level < 8
    ) {
      challengeLevelChange = 1;
      // Update writer profile
      await supabase
        .from('writer_profiles')
        .update({ challenge_level: session.challenge_level + 1 })
        .eq('user_id', user.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        evaluation: {
          storyPower: evaluation.storyPower,
          craftGrowth: evaluation.craftGrowth,
          detectedElements: evaluation.detectedElements,
        },
        directorsNotes: evaluation.directorsNotes,
        sessionUpdate: {
          phase: session.phase,
          xpEarned,
          challengeLevelChange,
        },
      },
    });
  } catch (error) {
    console.error('Error evaluating draft:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to evaluate draft' } },
      { status: 500 }
    );
  }
}
