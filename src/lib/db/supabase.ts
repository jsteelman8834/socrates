import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

type GenericTableDefinition = {
  Row: any;
  Insert: any;
  Update: any;
  Relationships: [];
};

type GenericViewDefinition = {
  Row: any;
  Relationships: [];
};

type GenericFunctionDefinition = {
  Args: Record<string, unknown> | never;
  Returns: unknown;
};

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
          stripe_customer_id: string | null;
          avatar_url: string | null;
          avatar_choice: string | null;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['users']['Row'],
          'id' | 'created_at' | 'updated_at' | 'stripe_customer_id' | 'avatar_url' | 'avatar_choice' | 'parent_id'
        > & {
          stripe_customer_id?: string | null;
          avatar_url?: string | null;
          avatar_choice?: string | null;
          parent_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan_type: string;
          status: string;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['subscriptions']['Row'],
          | 'id'
          | 'created_at'
          | 'updated_at'
          | 'stripe_customer_id'
          | 'stripe_subscription_id'
          | 'current_period_start'
          | 'current_period_end'
          | 'cancel_at_period_end'
        > & {
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
        Relationships: [];
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
          math_fluency_rating: number;
          math_concept_rating: number;
          math_problem_solving_rating: number;
          math_learning_profile: string | null;
          badges_earned: string[];
          current_topic_id: string | null;
          topics_completed: string[];
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['student_profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['student_profiles']['Insert']>;
        Relationships: [];
      };
      topics: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          grade_level: number;
          subject: string;
          domain: string | null;
          display_order: number;
          parent_topic_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['topics']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['topics']['Insert']>;
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          topic_id: string;
          question_text: string;
          question_type: 'knowledge' | 'wisdom' | 'fluency' | 'concept' | 'problem_solving';
          base_difficulty: number;
          citation_text: string | null;
          citation_source: string | null;
          difficulty_tier: number;
          cognitive_verb: string;
          question_stem: string;
          correct_answer: string;
          answer_explanation: string;
          is_composite: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          subject: string | null;
          domain: string | null;
          math_expression: string | null;
          visualization_hint: string | null;
        };
        Insert: Omit<Database['public']['Tables']['questions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['questions']['Insert']>;
        Relationships: [];
      };
      answer_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          option_label: string;
          is_correct: boolean;
          difficulty_tier: number;
          distractor_type: string | null;
          confusion_explanation: string | null;
          trap_explanation: string | null;
          related_concept: string | null;
          error_description: string | null;
          pythagoras_guidance: string | null;
          show_work_example: string | null;
          display_order: number;
          created_at: string;
          numeric_value: number | null;
        };
        Insert: Omit<Database['public']['Tables']['answer_options']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['answer_options']['Insert']>;
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
          current_question_id: string | null;
          asked_question_ids: string[] | null;
          subject: string;
          agent: string;
          fluency_correct: number;
          concept_correct: number;
          problem_solving_correct: number;
          procedural_knowledge_rating: number;
          conceptual_understanding_rating: number;
        };
        Insert: Partial<Database['public']['Tables']['learning_sessions']['Row']>;
        Update: Partial<Database['public']['Tables']['learning_sessions']['Insert']>;
        Relationships: [];
      };
      question_attempts: {
        Row: {
          id: string;
          session_id: string;
          question_id: string;
          selected_option_id: string | null;
          free_text_answer: string | null;
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
        Insert: Omit<
          Database['public']['Tables']['question_attempts']['Row'],
          | 'id'
          | 'created_at'
          | 'selected_option_id'
          | 'free_text_answer'
          | 'feedback_type'
          | 'feedback_text'
          | 'hint_level_used'
        > & {
          selected_option_id?: string | null;
          free_text_answer?: string | null;
          feedback_type?: string | null;
          feedback_text?: string | null;
          hint_level_used?: number | null;
        };
        Update: Partial<Database['public']['Tables']['question_attempts']['Insert']>;
        Relationships: [];
      };
      cognitive_fingerprints: {
        Row: {
          id: string;
          student_id: string;
          perception_score: number;
          perception_tendency: any;
          perception_observations_count: number;
          memory_score: number;
          memory_tendency: any;
          memory_observations_count: number;
          imagination_score: number;
          imagination_tendency: any;
          imagination_observations_count: number;
          reason_score: number;
          reason_tendency: any;
          reason_observations_count: number;
          desire_score: number;
          desire_tendency: any;
          desire_observations_count: number;
          primary_learning_style: string | null;
          profile_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['cognitive_fingerprints']['Row']>;
        Update: Partial<Database['public']['Tables']['cognitive_fingerprints']['Insert']>;
        Relationships: [];
      };
      virtue_progress: {
        Row: {
          id: string;
          student_id: string;
          curiosity_score: number;
          patience_score: number;
          precision_score: number;
          open_mindedness_score: number;
          fairness_score: number;
          temperance_score: number;
          courage_score: number;
          reflection_score: number;
          total_observations: number;
          virtue_narrative: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['virtue_progress']['Row']>;
        Update: Partial<Database['public']['Tables']['virtue_progress']['Insert']>;
        Relationships: [];
      };
      parent_insights: {
        Row: {
          id: string;
          student_id: string;
          headline: string;
          narrative: string;
          key_observations: any;
          virtue_highlights: any;
          growth_opportunities: any;
          stats: any;
          valid_from: string;
          valid_until: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['parent_insights']['Row']>;
        Update: Partial<Database['public']['Tables']['parent_insights']['Insert']>;
        Relationships: [];
      };
      next_session_adjustments: {
        Row: {
          id: string;
          student_id: string;
          subject: string;
          suggested_starting_tier: number;
          tier_adjustment_reason: string | null;
          suggested_session_length: number;
          pacing_notes: string | null;
          topic_preferences: string[] | null;
          avoid_topics: string[] | null;
          agent_notes: string | null;
          valid_until: string;
          applied: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['next_session_adjustments']['Row']>;
        Update: Partial<Database['public']['Tables']['next_session_adjustments']['Insert']>;
        Relationships: [];
      };
      curriculum_recommendations: {
        Row: {
          id: string;
          student_id: string;
          faculty_focus: string;
          cognitive_gap: string;
          gap_severity: number;
          recommended_experiences: any;
          is_active: boolean;
          progress_toward_goal: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['curriculum_recommendations']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['curriculum_recommendations']['Insert']>;
        Relationships: [];
      };
      pattern_hints: {
        Row: {
          id: string;
          question_id: string;
          hint_level: number;
          hint_text: string;
          visualization: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pattern_hints']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['pattern_hints']['Insert']>;
        Relationships: [];
      };
      [key: string]: GenericTableDefinition;
    };
    Views: {
      [key: string]: GenericViewDefinition;
    };
    Functions: {
      increment_xp: {
        Args: {
          user_id_param: string;
          xp_amount: number;
        };
        Returns: void;
      };
      [key: string]: GenericFunctionDefinition;
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
