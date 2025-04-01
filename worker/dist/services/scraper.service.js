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
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
class ScraperService {
    constructor(url) {
        this.url = url;
    }
    scraperAction() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.url) {
                    throw new Error("URL is required for scraper action");
                }
                console.log(`Scraping content from: ${this.url}`);
                const response = yield axios_1.default.get(this.url);
                const $ = cheerio_1.default.load(response.data);
                // extract title
                const title = $("h1").first().text().trim() || $("title").text().trim();
                // extract content
                let content = "";
                const possibleContentSelectors = [
                    "article",
                    ".post-content",
                    ".entry-content",
                    ".blog-content",
                    "main",
                    '[role="main"]',
                ];
                for (const selector of possibleContentSelectors) {
                    const selectedContent = $(selector).text().trim();
                    if (selectedContent.length > content.length) {
                        content = selectedContent;
                    }
                }
                if (!content) {
                    content = $("body").text().trim();
                }
                content = content.replace(/\s+/g, " ").trim();
                return {
                    title,
                    content,
                    url: this.url,
                    scrapedAt: new Date().toISOString(),
                };
            }
            catch (error) {
                console.error("Error in scraper action:", error);
                throw new Error(`Failed to scrape content: ${error.message}`);
            }
        });
    }
}
exports.default = ScraperService;
