import { createClient } from "@/utils/supabase/client";
import { InterviewData, InterviewFeedback } from "@/types/interview";
import { generateCustomQuestions } from "@/utils/generate-custom-question";
import { generatePersonalQuestions } from "@/utils/generate-personal-questions";
import { createServiceClient } from "@/utils/supabase/client";
import { UserService } from "./user.service";

/**
 * Service for handling interview-related database operations
 */
export class InterviewService {
  private userService: UserService;
  constructor() {
    this.userService = new UserService();
  }

  public async saveInterviewToSupabase(interviewData: InterviewData) {
    try {
      // Use service client to bypass RLS
      const supabase = createServiceClient();
      const session = await this.userService.getCurrentUser();

      if (!session.status || !session.data) {
        throw new Error("Error from authenticated user " + session.error);
      }

      // Get the current auth user ID
      const authUserId = session.data.id;

      // Get the user record to get the correct user ID from users table
      const userData = await this.userService.getAuthUserWithServiceRole(
        authUserId
      );

      if (!userData.status) {
        throw new Error("Error from authenticated user " + userData.error);
      }

      const userId = userData.data.id;

      if (interviewData.type === "PERSONAL") {
        // Fetch user profile details
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("fk_user_id", userId)
          .single();

        if (profileError) {
          throw new Error(`Error fetching profile: ${profileError.message}`);
        }

        if (!profileData) {
          throw new Error("User profile not found");
        }

        const { data: experience, error: experienceError } = await supabase
          .from("experiences")
          .select("*")
          .eq("fk_profile_id", profileData.id);

        const { data: projects, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("fk_profile_id", profileData.id);

        const { data: skills, error: skillsError } = await supabase
          .from("skills")
          .select("*")
          .eq("fk_profile_id", profileData.id);

        const questions = await generatePersonalQuestions(
          experience || [],
          projects || [],
          skills || []
        );

        interviewData.questions = questions;
        interviewData.skills = skills?.map(
          (skill: { name: string }) => skill.name
        );
      } else {
        const questions = await generateCustomQuestions(
          interviewData.skills || [],
          interviewData.jobDescription || ""
        );

        interviewData.questions = questions;
      }

      const { data: interviewResult, error: supabaseError } = await supabase
        .from("interviews")
        .insert({
          fk_user_id: userId,
          name: interviewData.name,
          type: interviewData.type,
          questions: interviewData.questions,
          skills: interviewData.skills || [],
          job_description: interviewData.jobDescription || [],
          created_at: new Date(),
        })
        .select()
        .single();

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      return {
        status: true,
        data: interviewResult,
        message: "Interview created successfully!",
      };
    } catch (err: any) {
      console.error("Error: ", err);
      throw err;
    }
  }

  /**
   * Save interview details, feedbacks, and summary to the database
   * @param interviewId - The ID of the interview
   * @param result - The parsed feedback results
   * @returns The interview details with related data
   */
  public async saveFeedbackData(
    interviewId: string,
    result: InterviewFeedback
  ) {
    try {
      // Use service client to bypass RLS
      const supabase = createServiceClient();

      // Create interview details
      const { data: interviewDetails, error: interviewDetailsError } =
        await supabase
          .from("interview_details")
          .insert({ fk_interview_id: interviewId, video: "" })
          .select("*")
          .single();

      if (interviewDetailsError) {
        console.error(
          "Error inserting interview details:",
          interviewDetailsError
        );
        throw new Error(
          `Error inserting interview detail: ${interviewDetailsError.message}`
        );
      }

      // Save feedback items - process them in parallel with Promise.all
      const feedbackPromises = result.feedback.map(async (feedback, index) => {
        const { error: feedbackResponseError } = await supabase
          .from("feedback")
          .insert({
            fk_interview_details_id: interviewDetails.id,
            label: feedback.label,
            question: feedback.question,
            answer: feedback.yourAnswer,
            feedback: feedback.feedback,
            suggesstion_for_improvement: feedback.suggestionsForImprovement,
          });

        if (feedbackResponseError) {
          console.error(
            `Error saving feedback ${index}:`,
            feedbackResponseError
          );
          throw new Error(
            `Error saving feedback ${index}: ${feedbackResponseError.message}`
          );
        }

        return true; // Return success
      });

      // Wait for all feedback items to be saved
      await Promise.all(feedbackPromises);

      // Save summary
      const { error: summaryError } = await supabase.from("summaries").insert({
        fk_interview_details_id: interviewDetails.id,
        relevant_responses: result.summary.relevantResponses,
        clarity_and_structure: result.summary.clarityAndStructure,
        professional_language: result.summary.professionalLanguage,
        initial_ideas: result.summary.initialIdeas,
        additional_notable_aspects: result.summary.additionalNotableAspects,
        score: result.summary.score,
      });

      if (summaryError) {
        console.error("Error saving summary:", summaryError);
        throw new Error(`Error saving summary: ${summaryError.message}`);
      }

      return {
        status: true,
        message: "Interview feedback saved successfully",
        data: interviewDetails,
      };
    } catch (error: any) {
      console.error("Error in saveFeedbackData:", error);
      return {
        status: false,
        message: `Failed to save feedback data: ${error.message}`,
        error: error.message || "Unknown error",
      };
    }
  }

  public async getInterviewsByUser() {
    try {
      const supabase = createClient();

      // Get the current user
      const {
        data: { user: current_user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !current_user) {
        throw new Error("Unauthorized");
      }

      // Get the user record to get the correct user ID from users table
      const userData = await this.userService.getAuthUserWithServiceRole(
        current_user.id
      );

      if (!userData.status) {
        throw new Error("Error from authenticated user " + userData.error);
      }

      const { data: interviews, error: supabaseError } = await supabase
        .from("interviews")
        .select(
          `
        *,
        interview_details!fk_interview_id(*,
          feedback!fk_interview_details_id(*),
          summaries!fk_interview_details_id(*)
        )
      `
        )
        .eq("fk_user_id", userData.data.id);

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      return {
        status: true,
        message: "Interviews retrieved successfully!",
        data: interviews,
      };
    } catch (err: any) {
      console.error("Error in getInterviewsByUser:", err);
      return {
        status: false,
        message: `Failed to retrieve interviews data: ${err.message}`,
        error: err.message || "Unknown error",
      };
    }
  }

  public async getInterviewById(interviewId: string | string[]) {
    try {
      const supabase = createClient();

      const { data: interview, error: supabaseError } = await supabase
        .from("interviews")
        .select(
          `
        *,
        interview_details!fk_interview_id(*,
          feedback!fk_interview_details_id(*),
          summaries!fk_interview_details_id(*)
        )
      `
        )
        .eq("id", interviewId)
        .single();

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      if (!interview) {
        throw new Error("Interview not found");
      }

      return {
        status: true,
        message: "Interview retrieved successfully!",
        data: interview,
      };
    } catch (err: any) {
      console.error("Error in getInterviewById:", err);
      return {
        status: false,
        message: `Failed to retrieve interviews data: ${err.message}`,
        error: err.message || "Unknown error",
      };
    }
  }

  public async getInterviewsByType(type: string | string[]) {
    try {
      const supabase = createClient();

      const { data: interviews, error: supabaseError } = await supabase
        .from("interviews")
        .select(
          `
          *,
          interview_details!fk_interview_id(*,
            feedback!fk_interview_details_id(*),
            summaries!fk_interview_details_id(*)
          )
        `
        )
        .eq("type", type);

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      if (!(interviews.length > 0)) {
        throw new Error("Interview not found");
      }

      return {
        status: true,
        message: "Interviews retrieved successfully!",
        data: interviews,
      };
    } catch (err: any) {
      console.error("Error in getInterviewsByType:", err);
      return {
        status: false,
        message: `Failed to retrieve interviews data: ${err.message}`,
        error: err.message || "Unknown error",
      };
    }
  }

  public async deleteInterview(interviewId: string) {
    try {
      const supabase = await createClient();
      // Get the current user
      const {
        data: { user: current_user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !current_user) {
        throw new Error("Unauthorized");
      }

      // Get the user record to get the correct user ID from users table
      const userData = await this.userService.getAuthUserWithServiceRole(
        current_user.id
      );

      if (!userData.status) {
        throw new Error("Error from authenticated user " + userData.error);
      }

      // Check if the interview belongs to the user
      const { data: existingInterview, error: fetchError } = await supabase
        .from("interviews")
        .select("fk_user_id")
        .eq("id", interviewId)
        .single();

      if (fetchError) {
        throw new Error(`Supabase error: ${fetchError.message}`);
      }

      if (!existingInterview) {
        throw new Error("Interview not found");
      }

      if (existingInterview.fk_user_id !== userData.data.id) {
        throw new Error("You don't have permission to delete this interview");
      }

      const { error: deleteError } = await supabase
        .from("interviews")
        .delete()
        .eq("id", interviewId);

      if (deleteError) {
        throw new Error(`Supabase error: ${deleteError.message}`);
      }

      return { status: true };
    } catch (err: any) {
      console.error("Error in deleteInterview:", err);
      return {
        status: false,
        message: `Failed to delete interviews data: ${err.message}`,
        error: err.message || "Unknown error",
      };
    }
  }
}