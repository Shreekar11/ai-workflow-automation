"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = __importDefault(require("openai"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class ModelService {
    constructor(url, title, content, system, model) {
        this.url = url;
        this.title = title;
        this.content = content;
        this.system = system;
        this.model = model;
    }
    llmAction() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const scraper_result = {
                url: this.url,
                title: this.title,
                content: this.content,
            };
            if (!scraper_result) {
                throw new Error("No scraper result found. Make sure the scraper action ran successfully.");
            }
            if (!this.system) {
                throw new Error("System prompt is required for LLM action");
            }
            console.log(`Processing content with LLM model: ${this.model}`);
            try {
                // Using OpenAI's API for GPT models
                if (this.model === "gpt-4o-mini") {
                    const openai = new openai_1.default({
                        apiKey: process.env.OPENAI_API_KEY,
                    });
                    // Create prompt with scraper content
                    const userPrompt = `Content from ${scraper_result.url}:\n\n${scraper_result.content}`;
                    const response = yield openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            {
                                role: "system",
                                content: this.system ||
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
                        result: ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "",
                        promptTokens: (_c = response.usage) === null || _c === void 0 ? void 0 : _c.prompt_tokens,
                        completionTokens: (_d = response.usage) === null || _d === void 0 ? void 0 : _d.completion_tokens,
                        processedAt: new Date().toISOString(),
                    };
                }
                else {
                    // Default to using Anthropic's API for Claude models
                    const anthropic = new sdk_1.default({
                        apiKey: process.env.ANTHROPIC_API_KEY,
                    });
                    // Create prompt with scraper content
                    const userPrompt = `Content from ${scraper_result.url}:\n\n${scraper_result.content}`;
                    const response = yield anthropic.messages.create({
                        model: this.model,
                        max_tokens: 4000,
                        system: this.system ||
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
                        result: ((_e = response.content[0]) === null || _e === void 0 ? void 0 : _e.type) === "text"
                            ? response.content[0].text
                            : "",
                        promptTokens: (_f = response.usage) === null || _f === void 0 ? void 0 : _f.input_tokens,
                        completionTokens: (_g = response.usage) === null || _g === void 0 ? void 0 : _g.output_tokens,
                        processedAt: new Date().toISOString(),
                    };
                }
            }
            catch (error) {
                console.error("Error in LLM action:", error);
                throw new Error(`Failed to process with LLM: ${error.message}`);
            }
        });
    }
}
exports.default = ModelService;
