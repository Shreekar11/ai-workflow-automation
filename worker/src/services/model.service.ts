import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export default class ModelService {
  private url: string;
  private title: string;
  private content: string;
  private system: string;
  private model: string;

  constructor(
    url: string,
    title: string,
    content: string,
    system: string,
    model: string
  ) {
    this.url = url;
    this.title = title;
    this.content = content;
    this.system = system;
    this.model = model;
  }

  public async llmAction() {
    const scraper_result = {
      url: this.url,
      title: this.title,
      content: this.content,
    };

    if (!scraper_result) {
      throw new Error(
        "No scraper result found. Make sure the scraper action ran successfully."
      );
    }

    if (!this.system) {
      throw new Error("System prompt is required for LLM action");
    }

    console.log(`Processing content with LLM model: ${this.model}`);

    try {
      // Using OpenAI's API for GPT models
      if (this.model.startsWith("gpt-")) {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        // Create prompt with scraper content
        const userPrompt = `Content from ${scraper_result.url}:\n\n${scraper_result.content}`;

        const response = await openai.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: "system",
              content: this.system || this.getDefaultSystemPrompt(),
            },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 4000,
        });

        return {
          model: this.model,
          result: response.choices[0]?.message?.content || "",
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
          processedAt: new Date().toISOString(),
        };
      } 
      // Using Google's API for Gemini models
      else if (this.model.startsWith("gemini")) {
        // Initialize Google Generative AI with API key
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
        
        // Map the model name to the correct Gemini model ID
        // Current Gemini models as of April 2025 include:
        // - gemini-1.5-pro
        // - gemini-1.5-flash
        // - gemini-1.0-pro
        // - gemini-1.0-pro-vision
        const geminiModel = genAI.getGenerativeModel({ 
          model: this.model,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4000,
          }
        });

        // Create prompt with scraper content
        const userPrompt = `Content from ${scraper_result.url}:\n\n${scraper_result.content}`;
        
        // Combine system prompt with user content for Gemini
        // (Gemini doesn't have dedicated system messages like OpenAI/Anthropic)
        const combinedPrompt = `${this.system || this.getDefaultSystemPrompt()}\n\n${userPrompt}`;

        // Generate content with the correct API call format
        const result = await geminiModel.generateContent(combinedPrompt);
        const response = result.response;
        const text = response.text();
        
        return {
          model: this.model,
          result: text,
          promptTokens: undefined, // Gemini doesn't provide token counts in the same way
          completionTokens: undefined,
          processedAt: new Date().toISOString(),
        };
      }
      // Using Anthropic's API for Claude models
      else {
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Create prompt with scraper content
        const userPrompt = `Content from ${scraper_result.url}:\n\n${scraper_result.content}`;

        const response = await anthropic.messages.create({
          model: this.model,
          max_tokens: 4000,
          system: this.system || this.getDefaultSystemPrompt(),
          messages: [{ role: "user", content: userPrompt }],
        });

        return {
          model: this.model,
          result:
            response.content[0]?.type === "text"
              ? response.content[0].text
              : "",
          promptTokens: response.usage?.input_tokens,
          completionTokens: response.usage?.output_tokens,
          processedAt: new Date().toISOString(),
        };
      }
    } catch (error: any) {
      console.error("Error in LLM action:", error);
      throw new Error(`Failed to process with LLM: ${error.message}`);
    }
  }

  private getDefaultSystemPrompt(): string {
    return `You are a content analysis assistant. 
      Extract the key information from the blog post, 
      including main topics, key arguments, supporting evidence, 
      and conclusions. Maintain the original meaning while organizing 
      the content clearly with appropriate headings. If technical 
      concepts are present, explain them in accessible language. 
      Focus on factual content rather than opinions or promotional material.`;
  }
}