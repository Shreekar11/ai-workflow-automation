import { google } from "googleapis";

export class GoogleSheetsService {
  private auth;
  private sheets;
  private sheetId: string;
  private range: string;
  private values: any[];

  constructor(sheetId: string, range: string, values: any[]) {
    this.sheetId = sheetId;
    this.range = range;
    this.values = values;

    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheets = google.sheets({ version: "v4", auth: this.auth });
  }

  private async getSheetInfo() {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.sheetId,
      });

      const sheets = response.data.sheets;
      if (!sheets || sheets.length === 0) {
        throw new Error("No sheets found in the spreadsheet");
      }

      const firstSheet = sheets[0].properties?.title || "Sheet1";

      if (!this.range.includes("!")) {
        this.range = `${firstSheet}!${this.range}`;
      } else {
        const sheetName = this.range.split("!")[0];
        const sheetExists = sheets.some(
          (sheet) => sheet.properties?.title === sheetName
        );
        if (!sheetExists) {
          throw new Error(
            `Sheet "${sheetName}" not found. Available sheets: ${sheets
              .map((s) => s.properties?.title)
              .join(", ")}`
          );
        }
      }
    } catch (error: any) {
      console.error("Error getting sheet info:", error);
      throw new Error(`Failed to verify sheet: ${error.message}`);
    }
  }

  async appendToSheet() {
    try {
      await this.getSheetInfo();

      const formattedValues = Array.isArray(this.values[0])
        ? this.values
        : [this.values];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.sheetId,
        range: this.range,
        valueInputOption: "RAW",
        requestBody: {
          values: formattedValues,
        },
      });

      console.log("Sheet response :- ", response.data);

      return {
        success: true,
        updatedRange: response.data.updates?.updatedRange,
        updatedRows: response.data.updates?.updatedRows,
      };
    } catch (error: any) {
      console.error("Error: ", {
        message: error.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        error: error?.response?.data?.error,
      });

      if (error?.response?.status === 403) {
        throw new Error(
          `Permission denied. Please ensure ${process.env.GOOGLE_CLIENT_EMAIL} has edit access to the spreadsheet.`
        );
      }

      if (error?.response?.status === 400) {
        throw new Error(
          `Invalid request. Please verify the sheet name and range format. Current range: ${this.range}`
        );
      }

      throw error;
    }
  }
}
