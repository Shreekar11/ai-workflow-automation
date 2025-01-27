import { ReactNode } from "react";
import { Mail, Webhook, FileSpreadsheet } from "lucide-react";
import { ValidationRules } from "@/types";

export const EMAIL_VALIDATION_RULES: Record<string, ValidationRules> = {
  to: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  from: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  subject: {
    required: true,
    maxLength: 255,
  },
  body: {
    required: true,
    minLength: 1,
  },
};

export const SHEETS_VALIDATION_RULES: Record<string, ValidationRules> = {
  sheetId: {
    required: true,
    minLength: 1,
  },
  range: {
    required: true,
    pattern: /^[^!]+![A-Z]+[0-9]+:[A-Z]+[0-9]+$/,
  },
  values: {
    required: true,
    pattern: /^[^,]+(?:,[^,]+)*$/,
    custom: (value: string) => {
      if (/\s/.test(value)) {
        return false;
      }
      const values = value.split(",");
      return values.length > 0 && values.every((v) => v.length > 0);
    },
  },
};

export const EMAIL_FIELDS = ["to", "from", "subject", "body"];
export const SHEETS_FIELDS = ["sheetId", "range", "values"];

export const FIELD_DESCRIPTIONS: {
  email: any;
  sheets: any;
} = {
  email: {
    to: "The email address of the recipient who will receive the email.",
    from: "The email address from which the email will be sent (defaults to your email).",
    subject: "The title or headline of the email that summarizes its content.",
    body: "The main text content of the email message.",
  },
  sheets: {
    sheetId:
      "The unique ID found in the Google Sheets URL. For example, in 'https://docs.google.com/spreadsheets/d/1ABC123xyz/edit#gid=0', the sheetId is '1ABC123xyz'.",
    range:
      "Specify the cell range to update, e.g., 'Sheet!A1:C1' to modify cells A1, B1, and C1. Follows standard spreadsheet notation.",
    values:
      "Comma-separated values to insert into the specified range. Example: 'John,Doe,john.doe@example.com' for a range of A1:C1.",
  },
};

export const getPlaceholder = (
  selectedOption: { name: string },
  field: string
) => {
  if (selectedOption.name === "Email") {
    switch (field) {
      case "to":
        return "e.g., recipient@example.com";
      case "from":
        return "e.g., sender@example.com";
      case "subject":
        return "e.g., Project Update - Q2 Results";
      case "body":
        return "e.g., Please find attached the quarterly report...";
      default:
        return `Enter ${field}`;
    }
  } else if (selectedOption.name === "Google Sheets") {
    switch (field) {
      case "sheetId":
        return "e.g., 1ABC123xyz";
      case "range":
        return "e.g., Sheet!A1:C1";
      case "values":
        return "e.g., John,Doe,john.doe@example.com";
      default:
        return `Enter ${field}`;
    }
  }
  return `Enter ${field}`;
};

export const optionStyles: Record<string, { icon: ReactNode }> = {
  Webhook: {
    icon: <Webhook />,
  },
  Email: {
    icon: <Mail />,
  },
  "Google Sheets": {
    icon: <FileSpreadsheet />,
  },
};
