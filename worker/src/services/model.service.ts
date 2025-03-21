import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

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
      if (this.model === "gpt-4o-mini") {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        // Create prompt with scraper content
        const userPrompt = `Content from ${scraper_result.url}:\n\n${scraper_result.content}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                this.system ||
                `You are a content analysis assistant. 
                Extract the key information from the blog post, 
                including main topics, key arguments, supporting evidence, 
                and conclusions. Maintain the original meaning while organizing 
                the content clearly with appropriate headings. If technical 
                concepts are present, explain them in accessible language. 
                Focus on factual content rather than opinions or promotional material.`,
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
      } else {
        // Default to using Anthropic's API for Claude models
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Create prompt with scraper content
        const userPrompt = `Content from ${scraper_result.url}:\n\n${scraper_result.content}`;

        const response = await anthropic.messages.create({
          model: this.model,
          max_tokens: 4000,
          system:
            this.system ||
            `You are a content analysis assistant. 
            Extract the key information from the blog post, 
            including main topics, key arguments, supporting evidence, 
            and conclusions. Maintain the original meaning while organizing 
            the content clearly with appropriate headings. If technical 
            concepts are present, explain them in accessible language. 
            Focus on factual content rather than opinions or promotional material.`,
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
}
