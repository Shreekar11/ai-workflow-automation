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
Object.defineProperty(exports, "__esModule", { value: true });
class GoogleDocsService {
    constructor(url, title, result, model, googleDocsId) {
        this.url = url;
        this.title = title;
        this.result = result;
        this.model = model;
        this.googleDocsId = googleDocsId;
    }
    googleDocsAction() {
        return __awaiter(this, void 0, void 0, function* () {
            const llm_result = {
                result: this.result,
            };
            if (!llm_result) {
                throw new Error("No LLM result found. Make sure the LLM action ran successfully.");
            }
            if (!this.googleDocsId) {
                throw new Error("Google Doc ID is required to update the document.");
            }
            try {
                const { google } = require("googleapis");
                const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "{}");
                if (!credentials.private_key || !credentials.client_email) {
                    throw new Error("Invalid credentials: Missing private_key or client_email");
                }
                const auth = new google.auth.GoogleAuth({
                    credentials,
                    scopes: [
                        "https://www.googleapis.com/auth/documents",
                        "https://www.googleapis.com/auth/drive.file",
                    ],
                });
                const client = yield auth.getClient();
                const docs = google.docs({ version: "v1", auth: client });
                const documentId = this.googleDocsId;
                let documentUrl = "";
                const documentContent = formatDocumentForGoogleDocs(this.title, this.url, llm_result.result, this.model);
                yield docs.documents.batchUpdate({
                    documentId,
                    requestBody: {
                        requests: [
                            {
                                insertText: {
                                    location: {
                                        index: 1,
                                    },
                                    text: documentContent,
                                },
                            },
                        ],
                    },
                });
                // Get document URL
                documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;
                return {
                    documentId,
                    documentUrl,
                    title: `Analysis of ${this.title}`,
                    updatedAt: new Date().toISOString(),
                };
            }
            catch (error) {
                console.error("Error in Google Doc action:", error);
                throw new Error(`Failed to write to Google Docs: ${error.message}`);
            }
        });
    }
}
exports.default = GoogleDocsService;
const formatDocumentForGoogleDocs = function (title, url, result, model) {
    const formattedDate = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
    });
    const firstParagraph = result.split("\n\n")[0];
    const cleanTitle = title.trim();
    const documentContent = `# Content Analysis: ${cleanTitle}

## Document Information
* **Source URL:** ${url}
* **Generated On:** ${formattedDate}
* **Analysis Model:** ${model}

## Executive Summary
${firstParagraph}

## Detailed Analysis
${result}

## Key Insights
${extractKeyInsights(result)}

---
*This document was automatically generated using AI content analysis. The analysis is intended to provide an objective summary of the original content.*
`;
    return documentContent;
};
function extractKeyInsights(analysisText) {
    const lines = analysisText.split("\n");
    const keyPoints = [];
    for (const line of lines) {
        const trimmedLine = line.trim();
        if ((trimmedLine.startsWith("##") ||
            trimmedLine.startsWith("*") ||
            trimmedLine.startsWith("-") ||
            /^\d+\./.test(trimmedLine)) &&
            trimmedLine.length > 3) {
            const cleanPoint = trimmedLine
                .replace(/^##\s+/, "")
                .replace(/^\*\s+/, "• ")
                .replace(/^-\s+/, "• ")
                .replace(/^\d+\.\s+/, "• ");
            keyPoints.push(cleanPoint);
        }
    }
    if (keyPoints.length < 2) {
        return "The key insights from this content include the main topics covered, supporting evidence presented, and conclusions drawn. Review the detailed analysis section for comprehensive information.";
    }
    return keyPoints.slice(0, 5).join("\n");
}
