export default class GoogleDocsService {
  private url: string;
  private title: string;
  private result: string;
  private model: string;
  private googleDocsId: string;
  private createNewDoc: string;
  
  constructor(
    url: string,
    title: string,
    result: string,
    model: string,
    googleDocsId: string,
    createNewDoc: string
  ) {
    this.url = url;
    this.title = title;
    this.result = result;
    this.model = model;
    this.googleDocsId = googleDocsId;
    this.createNewDoc = createNewDoc;
  }

  public async googleDocsAction() {
    const llm_result = {
      result: this.result,
    };

    if (!llm_result) {
      throw new Error(
        "No LLM result found. Make sure the LLM action ran successfully."
      );
    }

    // for existing doc updates, we need the doc ID
    if (!this.createNewDoc && !this.googleDocsId) {
      throw new Error(
        "Google Doc ID is required when updating an existing document"
      );
    }

    console.log(
      `${this.createNewDoc ? "Creating" : "Updating"} Google Doc${
        this.googleDocsId ? ": " + this.googleDocsId : ""
      }`
    );

    try {
      const { google } = require("googleapis");

      // Load credentials from environment or secure storage
      const credentials = JSON.parse(
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "{}"
      );

      // Set up authentication with service account
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          "https://www.googleapis.com/auth/documents",
          "https://www.googleapis.com/auth/drive.file",
        ],
      });

      const client = await auth.getClient();
      const docs = google.docs({ version: "v1", auth: client });
      const drive = google.drive({ version: "v3", auth: client });

      let documentId = this.googleDocsId;
      let documentUrl = "";

      // format content for the document
      const formattedDate = new Date().toLocaleString();
      const documentContent = `# Analysis of ${this.title}
        
        Source: ${this.url}
        Generated: ${formattedDate}
        
        ## Summary
        ${llm_result.result}
        
        ---
        Generated using AI model: ${this.model}
        `;

      if (this.createNewDoc) {
        // Create a new document
        const createResponse = await docs.documents.create({
          requestBody: {
            title: `Analysis of ${this.title}`,
          },
        });

        documentId = createResponse.data.documentId;
      }

      // Insert or update document content
      await docs.documents.batchUpdate({
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
    } catch (error: any) {
      console.error("Error in Google Doc action:", error);
      throw new Error(`Failed to write to Google Docs: ${error.message}`);
    }
  }
}
