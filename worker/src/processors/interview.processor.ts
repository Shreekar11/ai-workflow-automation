import { UserService } from "../services/user.service";
import { FeedbackService } from "../services/feedback.service";
import { InterviewService } from "../services/interview.service";
import { SupabaseClient } from "@supabase/supabase-js";

export async function processInterviewMessage(
  supabase: SupabaseClient,
  interviewId: string,
  transcript: any[],
) {
  try {
    const [interview_id, authId] = interviewId.split("&");

    // Formatting transcription data
    const formattedTranscript = [];
    for (let i = 0; i < transcript.length; i += 2) {
      formattedTranscript.push({
        assistant: transcript[i][1] || "",
        client: transcript[i + 1]?.[1] || "",
      });
    }

    const userService = new UserService();
    const user = await userService.getAuthUserWithServiceRole(authId);
    if(!user.status) {
      throw new Error(user.message);
    }

    // Format the transcript for prompt
    const promptTranscript = formattedTranscript
      .map(
        (
          exchange: {
            assistant: string;
            client: string;
          },
          index: number
        ) => `
    Question ${index + 1}: ${exchange.assistant}
    Answer ${index + 1}: ${exchange.client}
    `
      )
      .join("\n");

    const feedbackService = new FeedbackService();
    const gemini_feedback = await feedbackService.getFeedback(promptTranscript);

    const feedback_data = await gemini_feedback.json();
    const feedbacks = feedback_data.data?.split(/\n{2,}/);
    const result = feedbackService.parseInterviewFeedback(feedbacks);

    const interviewService = new InterviewService();
    await interviewService.saveFeedbackData(interviewId, result);

    return result;
  } catch (err: any) {
    console.error("Error: ", err);
  }
}