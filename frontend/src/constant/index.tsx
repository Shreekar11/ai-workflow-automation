import { ReactNode } from "react";
import { Clock, Mail, Webhook, FileSpreadsheet } from "lucide-react";

export const EMAIL_FIELDS = ["to", "from", "subject", "body"];
export const SHEETS_FIELDS = ["sheetId", "range", "values"];

export const optionStyles: Record<string, { icon: ReactNode }> = {
  Webhook: {
    icon: <Webhook />,
  },
  Email: {
    icon: <Mail />,
  },
  Schedule: {
    icon: <Clock />,
  },
  "Google Sheets": {
    icon: <FileSpreadsheet />,
  },
};