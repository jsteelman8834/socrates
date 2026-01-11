/**
 * GET /api/aristotle/insights/:studentId
 *
 * Returns Aristotle's parent-facing insights about a student's learning patterns.
 * This is the narrative about HOW the child learns, not just what they know.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';
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
    const { data: requestingUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('clerk_id', userId)
      .single();

    if (!requestingUser) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Verify access - user must be the student, their parent, or an admin
    const hasAccess =
      requestingUser.id === studentId ||
      requestingUser.role === 'admin' ||
      requestingUser.role === 'parent';

    if (!hasAccess) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Check for a recent valid insight
    const { data: existingInsight } = await supabase
      .from('parent_insights')
      .select('*')
      .eq('student_id', studentId)
      .gt('valid_until', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingInsight) {
      return NextResponse.json({
        success: true,
        data: {
          headline: existingInsight.headline,
          narrative: existingInsight.narrative,
          keyObservations: existingInsight.key_observations,
          virtueHighlights: existingInsight.virtue_highlights,
          growthOpportunities: existingInsight.growth_opportunities,
          stats: existingInsight.stats,
          generatedAt: existingInsight.created_at,
          cached: true,
        },
      });
    }

    // Generate fresh insight
    const insight = await aristotle.generateParentInsight(studentId);

    return NextResponse.json({
      success: true,
      data: {
        headline: insight.headline,
        narrative: insight.narrative,
        keyObservations: insight.keyObservations,
        virtueHighlights: insight.virtueHighlights,
        growthOpportunities: insight.growthOpportunities,
        stats: insight.stats,
        generatedAt: insight.generatedAt.toISOString(),
        cached: false,
      },
    });
  } catch (error) {
    console.error('Error generating parent insight:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate insight',
        },
      },
      { status: 500 }
    );
  }
}
