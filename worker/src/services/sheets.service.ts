import { google } from 'googleapis';

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
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async appendToSheet() {
    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.sheetId,
        range: this.range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [this.values],
        },
      });

      return {
        success: true,
        updatedRange: response.data.updates?.updatedRange,
      };
    } catch (error) {
      console.error('Error appending to sheet:', error);
      throw new Error('Failed to append to Google Sheet');
    }
  }
}