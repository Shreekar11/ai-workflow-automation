import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export class FeedbackService {
  public async getFeedback(transcript: string) {
    const prompt = `Analyze the following interview conversation based on the transcript and provide feedback directly to the interviewee. 
    ${transcript}
    
    For each response, STRICTLY FOLLOW this exact formatting WITHOUT ANY ASTERISKS:
    
    Label: [GOOD/NEEDS_IMPROVEMENT]
    Question: [Interviewer's question]
    Your Answer: [Interviewee's answer]
    Feedback: [Provide direct feedback to the interviewee]
    Category: [List applicable categories from:
    - Formality of Language
    - Clarity of Content
    - Logical Organization
    - Conciseness
    - Relevance to Question
    - Completeness of Answer]
    Suggestions for improvement: [Specific improvements for each listed category]
    
    Overall Performance Summary
    After analyzing all individual responses, provide a summary using this format:

    For each response, STRICTLY FOLLOW this exact formatting WITHOUT ANY ASTERISKS:

    Relevant Responses: [How well answers aligned with questions]
    Clarity and Structure: [Coherence and organization of answers]
    Professional Language: [Professionalism of language]
    Initial Ideas: [Originality or thoughtfulness]
    Additional Notable Aspects: [Other strengths or improvement areas]
    Score: [X/10]
    
    IMPORTANT INSTRUCTIONS:
    1. Use the EXACT format shown above
    2. Do NOT use asterisks anywhere
    3. Be direct and specific in your feedback
    4. Address the interviewee directly
    
    Example:
    Label: Needs Improvement
    Question: Tell me about your previous work experience
    Your Answer: I worked at companies and did stuff
    Feedback: Your response lacks specific details and professional language
    Category: Formality of Language, Clarity of Content, Completeness of Answer
    Suggestions for improvement: Use more formal business language, Provide specific details about roles and responsibilities, Include timeline and company names with concrete achievements
    
    Example Overall Performance Summary:
    Relevant Responses: Your responses needed more alignment with the questions asked
    Clarity and Structure: Responses lacked proper structure and organization
    Professional Language: Language used was too informal for an interview setting
    Initial Ideas: You showed some creative thinking in your approaches
    Additional Notable Aspects: Need to improve response completeness
    Score: 5/10`;

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content using Gemini
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2500,
      },
    });

    const gemini_feedback = result.response.text().trim();

    return gemini_feedback as any;
  }

  public parseInterviewFeedback(feedbacks: string[]) {
    const feedback_result: any[] = [];
    let feedback_object: any | null = null;
    let performance_summary: any | null = null;

    feedbacks.forEach((feedback: string) => {
      const relevantResponsesMatch = feedback.match(
        /Relevant Responses: (.+)/
      );
      const clarityMatch = feedback.match(/Clarity and Structure: (.+)/);
      const languageMatch = feedback.match(/Professional Language: (.+)/);
      const ideasMatch = feedback.match(/Initial Ideas: (.+)/);
      const aspectsMatch = feedback.match(/Additional Notable Aspects: (.+)/);
      const scoreMatch = feedback.match(/Score: (.+)/);

      if (
        relevantResponsesMatch ||
        clarityMatch ||
        languageMatch ||
        ideasMatch ||
        aspectsMatch ||
        scoreMatch
      ) {
        if (!performance_summary) {
          performance_summary = {
            relevantResponses: "",
            clarityAndStructure: "",
            professionalLanguage: "",
            initialIdeas: "",
            additionalNotableAspects: "",
            score: "",
          };
        }

        if (relevantResponsesMatch)
          performance_summary.relevantResponses =
            relevantResponsesMatch[1].trim();
        if (clarityMatch)
          performance_summary.clarityAndStructure = clarityMatch[1].trim();
        if (languageMatch)
          performance_summary.professionalLanguage = languageMatch[1].trim();
        if (ideasMatch)
          performance_summary.initialIdeas = ideasMatch[1].trim();
        if (aspectsMatch)
          performance_summary.additionalNotableAspects =
            aspectsMatch[1].trim();
        if (scoreMatch) performance_summary.score = scoreMatch[1].trim();

        return;
      }

      // Process detailed feedback
      const labelMatch = feedback.match(/Label: (.+)/);
      const questionMatch = feedback.match(/Question: (.+)/);
      const yourAnswerMatch = feedback.match(/Your Answer: (.+)/);
      const feedbackMatch = feedback.match(/Feedback: (.+)/);
      const categoryMatch = feedback.match(/Category: (.+)/);
      const suggestionsMatch = feedback.match(
        /Suggestions for improvement: (.+)/
      );

      if (labelMatch) {
        if (feedback_object) {
          feedback_result.push(feedback_object);
        }

        feedback_object = {
          label: labelMatch[1].trim(),
          question: questionMatch ? questionMatch[1].trim() : "",
          yourAnswer: yourAnswerMatch ? yourAnswerMatch[1].trim() : "",
          feedback: feedbackMatch ? feedbackMatch[1].trim() : "",
          category: categoryMatch ? categoryMatch[1].trim() : null,
          suggestionsForImprovement: suggestionsMatch
            ? suggestionsMatch[1].trim()
            : null,
        };
      } else if (feedback_object) {
        if (categoryMatch) feedback_object.category = categoryMatch[1].trim();
        if (suggestionsMatch)
          feedback_object.suggestionsForImprovement =
            suggestionsMatch[1].trim();
      }
    });

    // Push the last feedback object if it exists
    if (feedback_object) {
      feedback_result.push(feedback_object);
    }

    return {
      feedback: feedback_result,
      summary: performance_summary,
    };
}
}
