import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';

/**
 * POST /api/franklin-academy/enroll
 *
 * Enroll student in Franklin's Grandson Academy or resume existing enrollment.
 * Creates enrollment record if none exists, otherwise returns existing enrollment.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Get user from database
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

    // Check if enrollment already exists
    const { data: existingEnrollment, error: enrollmentQueryError } = await supabase
      .from('franklin_academy_enrollments')
      .select('*')
      .eq('student_id', user.id)
      .single();

    if (enrollmentQueryError && enrollmentQueryError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - that's expected for new enrollments
      console.error('Enrollment query error:', enrollmentQueryError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to check enrollment' } },
        { status: 500 }
      );
    }

    // If enrollment exists, return it
    if (existingEnrollment) {
      return NextResponse.json({
        success: true,
        enrollment: {
          id: existingEnrollment.id,
          studentId: existingEnrollment.student_id,
          currentWeek: existingEnrollment.current_week,
          currentDay: existingEnrollment.current_day,
          completedDays: existingEnrollment.completed_days,
          curiosityScore: existingEnrollment.curiosity_score,
          courageScore: existingEnrollment.courage_score,
          logicScore: existingEnrollment.logic_score,
          communicationScore: existingEnrollment.communication_score,
          startedAt: existingEnrollment.started_at,
          lastSessionAt: existingEnrollment.last_session_at,
          completedAt: existingEnrollment.completed_at,
        },
      });
    }

    // Create new enrollment
    const { data: newEnrollment, error: createError } = await supabase
      .from('franklin_academy_enrollments')
      .insert({
        student_id: user.id,
        current_week: 1,
        current_day: 1,
        completed_days: [],
        curiosity_score: 0,
        courage_score: 0,
        logic_score: 0,
        communication_score: 0,
      })
      .select()
      .single();

    if (createError) {
      console.error('Enrollment creation error:', createError);
      return NextResponse.json(
        { error: { code: 'CREATION_ERROR', message: 'Failed to create enrollment' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      enrollment: {
        id: newEnrollment.id,
        studentId: newEnrollment.student_id,
        currentWeek: newEnrollment.current_week,
        currentDay: newEnrollment.current_day,
        completedDays: newEnrollment.completed_days,
        curiosityScore: newEnrollment.curiosity_score,
        courageScore: newEnrollment.courage_score,
        logicScore: newEnrollment.logic_score,
        communicationScore: newEnrollment.communication_score,
        startedAt: newEnrollment.started_at,
        lastSessionAt: newEnrollment.last_session_at,
        completedAt: newEnrollment.completed_at,
      },
    });
  } catch (error) {
    console.error('Enrollment API error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
