/**
 * POST /api/writing/sessions/:sessionId/draft
 * Save or update a story draft
 *
 * GET /api/writing/sessions/:sessionId/draft
 * Get the current draft for this session
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';
import { shakespeare } from '@/lib/ai/shakespeare-agent';
import { z } from 'zod';
import type { DraftType } from '@/types/writing';

const saveDraftSchema = z.object({
  content: z.string().min(1),
  draftType: z.enum(['warm_up', 'first_draft', 'revision', 'final']),
  timeSpentSeconds: z.number().min(0),
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
    const validation = saveDraftSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: validation.error.message } },
        { status: 400 }
      );
    }

    const { content, draftType, timeSpentSeconds } = validation.data;
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

    const { data: session } = await supabase
      .from('writing_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('student_id', user.id)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );
    }

    // Calculate word count
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    // Mark previous drafts as not current
    await supabase
      .from('story_drafts')
      .update({ is_current: false })
      .eq('session_id', sessionId);

    // Get current version number
    const { data: existingDrafts } = await supabase
      .from('story_drafts')
      .select('version')
      .eq('session_id', sessionId)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = (existingDrafts?.[0]?.version || 0) + 1;

    // Create new draft
    const { data: draft, error: draftError } = await supabase
      .from('story_drafts')
      .insert({
        session_id: sessionId,
        version: nextVersion,
        is_current: true,
        draft_type: draftType,
        content,
        word_count: wordCount,
        time_spent_seconds: timeSpentSeconds,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (draftError) {
      console.error('Error saving draft:', draftError);
      return NextResponse.json(
        { error: { code: 'DRAFT_ERROR', message: 'Failed to save draft' } },
        { status: 500 }
      );
    }

    // Update session metrics
    const updates: Record<string, unknown> = {
      total_words_written: wordCount,
    };

    // Track first word timing
    if (nextVersion === 1 && !session.time_to_first_word_seconds) {
      const sessionStart = new Date(session.started_at);
      const now = new Date();
      updates.time_to_first_word_seconds = Math.round(
        (now.getTime() - sessionStart.getTime()) / 1000
      );
    }

    // Track revisions
    if (draftType === 'revision') {
      updates.revision_count = (session.revision_count || 0) + 1;
    }

    // Update phase completions
    if (draftType === 'warm_up' && !session.warm_up_completed_at) {
      updates.warm_up_completed_at = new Date().toISOString();
      updates.phase = 'create';
    } else if (draftType === 'first_draft' && !session.create_completed_at) {
      updates.create_completed_at = new Date().toISOString();
      updates.phase = 'upgrade';
    } else if (draftType === 'revision' && !session.upgrade_completed_at) {
      updates.upgrade_completed_at = new Date().toISOString();
      updates.phase = 'reflect';
    } else if (draftType === 'final') {
      updates.phase = 'complete';
      updates.status = 'completed';
      updates.ended_at = new Date().toISOString();
    }

    await supabase.from('writing_sessions').update(updates).eq('id', sessionId);

    // Generate encouragement based on draft type
    let encouragement: string | undefined;
    if (draftType === 'warm_up') {
      const { data: profile } = await supabase
        .from('writer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const response = await shakespeare.respondToWarmUp(content, profile as any);
        encouragement = response.message;
      }
    } else if (wordCount > 0 && wordCount % 50 === 0) {
      encouragement = `${wordCount} words! Your story is growing!`;
    }

    return NextResponse.json({
      success: true,
      data: {
        draftId: draft.id,
        version: draft.version,
        wordCount,
        autoSaved: false,
        encouragement,
        phase: updates.phase || session.phase,
      },
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to save draft' } },
      { status: 500 }
    );
  }
}

export async function GET(
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

    const { data: session } = await supabase
      .from('writing_sessions')
      .select('student_id')
      .eq('id', sessionId)
      .single();

    if (!session || session.student_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );
    }

    // Get current draft
    const { data: draft } = await supabase
      .from('story_drafts')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_current', true)
      .single();

    if (!draft) {
      return NextResponse.json({
        success: true,
        data: { draft: null },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        draft: {
          id: draft.id,
          version: draft.version,
          draftType: draft.draft_type,
          content: draft.content,
          wordCount: draft.word_count,
          timeSpentSeconds: draft.time_spent_seconds,
          submittedAt: draft.submitted_at,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching draft:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch draft' } },
      { status: 500 }
    );
  }
}
