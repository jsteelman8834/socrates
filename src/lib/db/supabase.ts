import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Types will be generated from Supabase schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string;
          display_name: string;
          role: 'student' | 'parent' | 'admin';
          avatar_choice: string | null;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      student_profiles: {
        Row: {
          id: string;
          user_id: string;
          knowledge_rating: number;
          wisdom_rating: number;
          overall_rating: number;
          total_xp: number;
          current_level: number;
          learning_profile: string | null;
          badges_earned: string[];
          current_topic_id: string | null;
          topics_completed: string[];
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['student_profiles']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['student_profiles']['Insert']>;
      };
      topics: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          grade_level: number;
          subject: string;
          display_order: number;
          parent_topic_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['topics']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['topics']['Insert']>;
      };
      questions: {
        Row: {
          id: string;
          topic_id: string;
          question_text: string;
          question_type: 'knowledge' | 'wisdom';
          difficulty_tier: number;
          cognitive_verb: string;
          question_stem: string;
          correct_answer: string;
          answer_explanation: string;
          is_composite: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['questions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['questions']['Insert']>;
      };
      answer_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          option_label: string;
          is_correct: boolean;
          distractor_type: string | null;
          confusion_explanation: string | null;
          related_concept: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['answer_options']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['answer_options']['Insert']>;
      };
      mnemonics: {
        Row: {
          id: string;
          question_id: string;
          mnemonic_text: string;
          mnemonic_type: string;
          effectiveness_score: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['mnemonics']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['mnemonics']['Insert']>;
      };
      socratic_hints: {
        Row: {
          id: string;
          question_id: string;
          hint_level: number;
          hint_text: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['socratic_hints']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['socratic_hints']['Insert']>;
      };
      learning_sessions: {
        Row: {
          id: string;
          student_id: string;
          topic_id: string;
          status: string;
          started_at: string;
          ended_at: string | null;
          questions_attempted: number;
          questions_correct: number;
          knowledge_correct: number;
          wisdom_correct: number;
          starting_tier: number;
          ending_tier: number | null;
          max_tier_reached: number;
          max_streak: number;
          current_streak: number;
          hearts_remaining: number;
          xp_earned: number;
          rating_change: number;
        };
        Insert: Omit<Database['public']['Tables']['learning_sessions']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['learning_sessions']['Insert']>;
      };
      question_attempts: {
        Row: {
          id: string;
          session_id: string;
          question_id: string;
          selected_option_id: string | null;
          is_correct: boolean;
          question_presented_at: string;
          answer_submitted_at: string;
          time_spent_seconds: number;
          feedback_type: string | null;
          feedback_text: string | null;
          hint_level_used: number | null;
          difficulty_tier_at_attempt: number;
          streak_at_attempt: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['question_attempts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['question_attempts']['Insert']>;
      };
    };
  };
};

// Server-side Supabase client
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookies in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookies in Server Components
          }
        },
      },
    }
  );
}

// Admin client with service role (for server-side operations)
export function createAdminSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
