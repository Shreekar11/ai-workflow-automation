import axios from "axios";
import cheerio from "cheerio";

export default class ScraperService {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  public async scraperAction() {
    try {
      if (!this.url) {
        throw new Error("URL is required for scraper action");
      }

      console.log(`Scraping content from: ${this.url}`);
      const response = await axios.get(this.url);
      const $ = cheerio.load(response.data);

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
    } catch (error: any) {
      console.error("Error in scraper action:", error);
      throw new Error(`Failed to scrape content: ${error.message}`);
    }
  }
}
