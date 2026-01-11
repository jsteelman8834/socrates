interface WeeklyReportData {
  parentName: string;
  childName: string;
  sessionsCompleted: number;
  questionsAnswered: number;
  knowledgeAccuracy: number;
  wisdomAccuracy: number;
  topStreak: number;
  xpEarned: number;
  learningProfile: 'encyclopedist' | 'strategist' | 'balanced';
  insights: string[];
}

export function createWeeklyReportEmail(data: WeeklyReportData): { html: string; text: string } {
  const profileDescriptions = {
    encyclopedist: 'Encyclopedist - Great at memorizing facts!',
    strategist: 'Strategist - Excellent at understanding concepts!',
    balanced: 'Balanced Learner - Well-rounded in all areas!',
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Progress Report</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #4F46E5; margin-bottom: 5px;">🦉 Virtual Socratic University</h1>
    <p style="color: #666; font-size: 14px;">Weekly Progress Report</p>
  </div>

  <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 25px; border-radius: 16px; margin-bottom: 25px;">
    <p style="margin: 0 0 10px 0; font-size: 16px;">Hello ${data.parentName}!</p>
    <p style="margin: 0; font-size: 18px;">Here's how <strong>${data.childName}</strong> did this week:</p>
  </div>

  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px;">
    <div style="background: #F3F4F6; padding: 20px; border-radius: 12px; text-align: center;">
      <div style="font-size: 32px; font-weight: bold; color: #4F46E5;">${data.sessionsCompleted}</div>
      <div style="font-size: 14px; color: #666;">Sessions Completed</div>
    </div>
    <div style="background: #F3F4F6; padding: 20px; border-radius: 12px; text-align: center;">
      <div style="font-size: 32px; font-weight: bold; color: #4F46E5;">${data.questionsAnswered}</div>
      <div style="font-size: 14px; color: #666;">Questions Answered</div>
    </div>
    <div style="background: #EFF6FF; padding: 20px; border-radius: 12px; text-align: center;">
      <div style="font-size: 32px; font-weight: bold; color: #2563EB;">${Math.round(data.knowledgeAccuracy * 100)}%</div>
      <div style="font-size: 14px; color: #666;">📚 Knowledge</div>
    </div>
    <div style="background: #FFFBEB; padding: 20px; border-radius: 12px; text-align: center;">
      <div style="font-size: 32px; font-weight: bold; color: #D97706;">${Math.round(data.wisdomAccuracy * 100)}%</div>
      <div style="font-size: 14px; color: #666;">🦉 Wisdom</div>
    </div>
  </div>

  <div style="background: #F0FDF4; border: 1px solid #86EFAC; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
    <h3 style="margin: 0 0 10px 0; color: #166534;">🏆 Achievements</h3>
    <p style="margin: 0;">
      <strong>Best Streak:</strong> ${data.topStreak} correct in a row<br>
      <strong>XP Earned:</strong> ${data.xpEarned} points<br>
      <strong>Learning Style:</strong> ${profileDescriptions[data.learningProfile]}
    </p>
  </div>

  <div style="background: #FEF3C7; border: 1px solid #FCD34D; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
    <h3 style="margin: 0 0 10px 0; color: #92400E;">💡 Socrates' Insights</h3>
    <ul style="margin: 0; padding-left: 20px;">
      ${data.insights.map((insight) => `<li style="margin-bottom: 8px;">${insight}</li>`).join('')}
    </ul>
  </div>

  <div style="text-align: center; margin-top: 30px;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      View Full Dashboard
    </a>
  </div>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #9CA3AF; font-size: 12px;">
    <p style="margin: 0;">"Education is the kindling of a flame, not the filling of a vessel." — Socrates</p>
    <p style="margin: 10px 0 0 0;">Virtual Socratic University</p>
  </div>
</body>
</html>
  `;

  const text = `
Virtual Socratic University - Weekly Progress Report

Hello ${data.parentName}!

Here's how ${data.childName} did this week:

STATS
- Sessions Completed: ${data.sessionsCompleted}
- Questions Answered: ${data.questionsAnswered}
- Knowledge Accuracy: ${Math.round(data.knowledgeAccuracy * 100)}%
- Wisdom Accuracy: ${Math.round(data.wisdomAccuracy * 100)}%

ACHIEVEMENTS
- Best Streak: ${data.topStreak} correct in a row
- XP Earned: ${data.xpEarned} points
- Learning Style: ${profileDescriptions[data.learningProfile]}

SOCRATES' INSIGHTS
${data.insights.map((insight) => `• ${insight}`).join('\n')}

View the full dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

---
"Education is the kindling of a flame, not the filling of a vessel." — Socrates
Virtual Socratic University
  `;

  return { html, text };
}

interface SessionCompleteData {
  parentName: string;
  childName: string;
  topic: string;
  questionsCorrect: number;
  totalQuestions: number;
  xpEarned: number;
  newLevel?: number;
}

export function createSessionCompleteEmail(data: SessionCompleteData): { html: string; text: string } {
  const accuracy = Math.round((data.questionsCorrect / data.totalQuestions) * 100);
  const emoji = accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Session Complete!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #4F46E5; margin-bottom: 5px;">🦉 Session Complete! ${emoji}</h1>
  </div>

  <div style="background: #F3F4F6; padding: 25px; border-radius: 16px; text-align: center;">
    <p style="margin: 0 0 10px 0; font-size: 16px;">Hello ${data.parentName}!</p>
    <p style="margin: 0; font-size: 18px;"><strong>${data.childName}</strong> just finished a session on <strong>${data.topic}</strong>!</p>
  </div>

  <div style="margin: 25px 0; text-align: center;">
    <div style="display: inline-block; background: ${accuracy >= 80 ? '#F0FDF4' : accuracy >= 60 ? '#FFFBEB' : '#FEF2F2'}; padding: 30px 50px; border-radius: 16px;">
      <div style="font-size: 48px; font-weight: bold; color: ${accuracy >= 80 ? '#166534' : accuracy >= 60 ? '#92400E' : '#991B1B'};">
        ${accuracy}%
      </div>
      <div style="font-size: 16px; color: #666;">
        ${data.questionsCorrect}/${data.totalQuestions} correct
      </div>
    </div>
  </div>

  <div style="text-align: center; margin-bottom: 25px;">
    <p style="font-size: 18px;">
      ⭐ <strong>+${data.xpEarned} XP</strong> earned!
      ${data.newLevel ? `<br>🎊 Reached <strong>Level ${data.newLevel}</strong>!` : ''}
    </p>
  </div>

  <div style="text-align: center;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      View Progress
    </a>
  </div>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #9CA3AF; font-size: 12px;">
    <p style="margin: 0;">Virtual Socratic University</p>
  </div>
</body>
</html>
  `;

  const text = `
Session Complete! ${emoji}

Hello ${data.parentName}!

${data.childName} just finished a session on ${data.topic}!

RESULTS
- Score: ${accuracy}% (${data.questionsCorrect}/${data.totalQuestions} correct)
- XP Earned: +${data.xpEarned}
${data.newLevel ? `- NEW LEVEL: ${data.newLevel}!` : ''}

View progress: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

---
Virtual Socratic University
  `;

  return { html, text };
}
