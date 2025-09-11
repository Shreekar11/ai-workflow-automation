export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type InterviewType = "PERSONAL" | "CUSTOM";
export type FeedbackLabel = "GOOD" | "NEEDS_IMPROVEMENT";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          auth_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          auth_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          auth_id?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          fk_user_id: string;
          first_name: string;
          last_name: string;
          about_me: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          fk_user_id: string;
          first_name: string;
          last_name: string;
          about_me: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          fk_user_id?: string;
          first_name?: string;
          last_name?: string;
          about_me?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      experiences: {
        Row: {
          id: string;
          fk_profile_id: string;
          company: string;
          position: string;
          description: string;
          start_date: string;
          end_date: string;
        };
        Insert: {
          id?: string;
          fk_profile_id: string;
          company: string;
          position: string;
          description: string;
          start_date: string;
          end_date: string;
        };
        Update: {
          id?: string;
          fk_profile_id?: string;
          company?: string;
          position?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          fk_profile_id: string;
          project_name: string;
          description: string;
          start_date: string;
          end_date: string;
        };
        Insert: {
          id?: string;
          fk_profile_id: string;
          project_name: string;
          description: string;
          start_date: string;
          end_date: string;
        };
        Update: {
          id?: string;
          fk_profile_id?: string;
          project_name?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
        };
      };
      skills: {
        Row: {
          id: number;
          fk_profile_id: string;
          skill_name: string;
          description: string;
        };
        Insert: {
          id?: number;
          fk_profile_id: string;
          skill_name: string;
          description: string;
        };
        Update: {
          id?: number;
          fk_profile_id?: string;
          skill_name?: string;
          description?: string;
        };
      };
      interviews: {
        Row: {
          id: string;
          fk_user_id: string;
          name: string;
          type: InterviewType;
          questions: string[];
          skills: string[];
          job_description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          fk_user_id: string;
          name: string;
          type: InterviewType;
          questions: string[];
          skills?: string[];
          job_description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          fk_user_id?: string;
          name?: string;
          type?: InterviewType;
          questions?: string[];
          skills?: string[];
          job_description?: string | null;
          created_at?: string;
        };
      };
      interview_details: {
        Row: {
          id: string;
          fk_interview_id: string;
          video: string;
        };
        Insert: {
          id?: string;
          fk_interview_id: string;
          video: string;
        };
        Update: {
          id?: string;
          fk_interview_id?: string;
          video?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          fk_interview_details_id: string;
          label: FeedbackLabel;
          question: string;
          answer: string;
          feedback: string;
          suggesstion_for_improvement: string;
        };
        Insert: {
          id?: string;
          fk_interview_details_id: string;
          label: FeedbackLabel;
          question: string;
          answer: string;
          feedback: string;
          suggesstion_for_improvement: string;
        };
        Update: {
          id?: string;
          fk_interview_details_id?: string;
          label?: FeedbackLabel;
          question?: string;
          answer?: string;
          feedback?: string;
          suggesstion_for_improvement?: string;
        };
      };
      summaries: {
        Row: {
          id: string;
          fk_interview_details_id: string;
          relevant_responses: string;
          clarity_and_structure: string;
          professional_language: string;
          initial_ideas: string;
          additional_notable_aspects: string;
          score: number;
        };
        Insert: {
          id?: string;
          fk_interview_details_id: string;
          relevant_responses: string;
          clarity_and_structure: string;
          professional_language: string;
          initial_ideas: string;
          additional_notable_aspects: string;
          score: number;
        };
        Update: {
          id?: string;
          fk_interview_details_id?: string;
          relevant_responses?: string;
          clarity_and_structure?: string;
          professional_language?: string;
          initial_ideas?: string;
          additional_notable_aspects?: string;
          score?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      interview_type: InterviewType;
      feedback_label: FeedbackLabel;
    };
  };
}
