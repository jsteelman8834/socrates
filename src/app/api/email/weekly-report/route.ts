import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendEmail } from '@/lib/email/resend';
import { createWeeklyReportEmail } from '@/lib/email/templates';
import { createAdminSupabaseClient } from '@/lib/db/supabase';
import { classifyLearningProfile, summarizeStudentProgress } from '@/lib/ai/socrates-agent';

// This endpoint can be called by a cron job to send weekly reports
// Or manually by parents to get an instant report

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Get user and their children
    const { data: user } = await supabase
      .from('users')
      .select('id, email, display_name')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Get children (student profiles linked to this parent)
    const { data: children } = await supabase
      .from('student_profiles')
      .select('*, users!inner(display_name)')
      .eq('parent_id', user.id);

    if (!children || children.length === 0) {
      return NextResponse.json(
        { error: { code: 'NO_CHILDREN', message: 'No children linked to this account' } },
        { status: 400 }
      );
    }

    // For each child, generate and send a report
    const results = [];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    for (const child of children) {
      // Get weekly stats
      const { data: sessions } = await supabase
        .from('learning_sessions')
        .select('*, question_attempts(*)')
        .eq('user_id', child.user_id)
        .gte('started_at', oneWeekAgo.toISOString())
        .eq('status', 'completed');

      if (!sessions || sessions.length === 0) {
        continue;
      }

      // Calculate stats
      const totalAttempts = sessions.flatMap((s) => s.question_attempts || []);
      const knowledgeAttempts = totalAttempts.filter(
        (a: any) => a.question_type === 'knowledge'
      );
      const wisdomAttempts = totalAttempts.filter(
        (a: any) => a.question_type === 'wisdom'
      );

      const knowledgeAccuracy =
        knowledgeAttempts.length > 0
          ? knowledgeAttempts.filter((a: any) => a.is_correct).length / knowledgeAttempts.length
          : 0;
      const wisdomAccuracy =
        wisdomAttempts.length > 0
          ? wisdomAttempts.filter((a: any) => a.is_correct).length / wisdomAttempts.length
          : 0;

      const topStreak = Math.max(...sessions.map((s) => s.max_streak || 0));
      const totalXp = sessions.reduce((sum, s) => sum + (s.xp_earned || 0), 0);

      // Get learning profile
      const profile = await classifyLearningProfile(knowledgeAccuracy, wisdomAccuracy);

      // Generate AI insights
      const summary = await summarizeStudentProgress(child.user_id, {
        sessionsCompleted: sessions.length,
        questionsAnswered: totalAttempts.length,
        knowledgeAccuracy,
        wisdomAccuracy,
      });

      const insights = [
        summary,
        knowledgeAccuracy > wisdomAccuracy
          ? 'Shows strong fact retention. Consider more "why" questions for deeper understanding.'
          : wisdomAccuracy > knowledgeAccuracy
          ? 'Great critical thinking! Practice with flashcard-style questions to cement dates and names.'
          : 'Excellent balance between memorization and analysis.',
      ];

      // Create email
      const { html, text } = createWeeklyReportEmail({
        parentName: user.display_name || 'Parent',
        childName: (child.users as any).display_name || 'Student',
        sessionsCompleted: sessions.length,
        questionsAnswered: totalAttempts.length,
        knowledgeAccuracy,
        wisdomAccuracy,
        topStreak,
        xpEarned: totalXp,
        learningProfile: profile.profile,
        insights,
      });

      // Send email
      const emailResult = await sendEmail({
        to: user.email,
        subject: `📊 ${(child.users as any).display_name}'s Weekly Progress Report`,
        html,
        text,
      });

      results.push({
        childId: child.id,
        childName: (child.users as any).display_name,
        sent: emailResult.success,
      });
    }

    return NextResponse.json({
      success: true,
      data: { reports: results },
    });
  } catch (error) {
    console.error('Weekly report error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
