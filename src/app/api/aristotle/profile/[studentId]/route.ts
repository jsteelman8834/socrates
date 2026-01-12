/**
 * GET /api/aristotle/profile/:studentId
 *
 * Returns the student's cognitive fingerprint and virtue progress.
 * Used by parent dashboard and (in simplified form) by student.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminSupabaseClient, Database } from '@/lib/db/supabase';
import { aristotle } from '@/lib/ai/aristotle-agent';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { studentId } = params;
    const supabase = createAdminSupabaseClient();

    // Get the requesting user
    const { data: requestingUser }: { data: Database['public']['Tables']['users']['Row'] | null } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (!requestingUser) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Verify access - students can view own, admins can view all, parents can view their children
    let hasAccess = requestingUser.id === studentId || requestingUser.role === 'admin';

    // If parent, verify they are the parent of this student
    if (!hasAccess && requestingUser.role === 'parent') {
      const { data: student }: { data: { parent_id: string | null } | null } = await supabase
        .from('users')
        .select('parent_id')
        .eq('id', studentId)
        .single();

      hasAccess = student?.parent_id === requestingUser.id;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Get cognitive fingerprint
    const { data: fingerprint }: { data: Database['public']['Tables']['cognitive_fingerprints']['Row'] | null } = await supabase
      .from('cognitive_fingerprints')
      .select('*')
      .eq('student_id', studentId)
      .single();

    // Get virtue progress
    const { data: virtues }: { data: Database['public']['Tables']['virtue_progress']['Row'] | null } = await supabase
      .from('virtue_progress')
      .select('*')
      .eq('student_id', studentId)
      .single();

    // Get curriculum recommendations
    const { data: recommendations }: { data: Database['public']['Tables']['curriculum_recommendations']['Row'][] | null } = await supabase
      .from('curriculum_recommendations')
      .select('*')
      .eq('student_id', studentId)
      .eq('is_active', true);

    // Get next session adjustments
    const { data: adjustments }: { data: Database['public']['Tables']['next_session_adjustments']['Row'][] | null } = await supabase
      .from('next_session_adjustments')
      .select('*')
      .eq('student_id', studentId)
      .gt('valid_until', new Date().toISOString())
      .eq('applied', false);

    // Format response
    const response = {
      fingerprint: fingerprint
        ? {
            perception: {
              score: fingerprint.perception_score,
              tendency: fingerprint.perception_tendency,
              observations: fingerprint.perception_observations_count,
            },
            memory: {
              score: fingerprint.memory_score,
              tendency: fingerprint.memory_tendency,
              observations: fingerprint.memory_observations_count,
            },
            imagination: {
              score: fingerprint.imagination_score,
              tendency: fingerprint.imagination_tendency,
              observations: fingerprint.imagination_observations_count,
            },
            reason: {
              score: fingerprint.reason_score,
              tendency: fingerprint.reason_tendency,
              observations: fingerprint.reason_observations_count,
            },
            desire: {
              score: fingerprint.desire_score,
              tendency: fingerprint.desire_tendency,
              observations: fingerprint.desire_observations_count,
            },
            learningStyle: fingerprint.primary_learning_style,
            summary: fingerprint.profile_summary,
            updatedAt: fingerprint.updated_at,
          }
        : null,

      virtues: virtues
        ? {
            intellectual: {
              curiosity: virtues.curiosity_score,
              patience: virtues.patience_score,
              precision: virtues.precision_score,
              openMindedness: virtues.open_mindedness_score,
            },
            moral: {
              fairness: virtues.fairness_score,
              temperance: virtues.temperance_score,
              courage: virtues.courage_score,
              reflection: virtues.reflection_score,
            },
            totalObservations: virtues.total_observations,
            narrative: virtues.virtue_narrative,
            updatedAt: virtues.updated_at,
          }
        : null,

      curriculumRecommendations: (recommendations || []).map((r) => ({
        facultyFocus: r.faculty_focus,
        cognitiveGap: r.cognitive_gap,
        severity: r.gap_severity,
        experiences: r.recommended_experiences,
        progress: r.progress_toward_goal,
      })),

      nextSessionAdjustments: (adjustments || []).map((a) => ({
        subject: a.subject,
        suggestedTier: a.suggested_starting_tier,
        tierReason: a.tier_adjustment_reason,
        sessionLength: a.suggested_session_length,
        pacingNotes: a.pacing_notes,
        topicPreferences: a.topic_preferences,
        avoidTopics: a.avoid_topics,
        validUntil: a.valid_until,
      })),
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching cognitive profile:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch profile',
        },
      },
      { status: 500 }
    );
  }
}
