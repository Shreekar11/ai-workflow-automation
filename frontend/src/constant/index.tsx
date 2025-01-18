import { ReactNode } from "react";
import { Clock, Mail, Webhook } from "lucide-react";

export const EMAIL_FIELDS = ["to", "from", "subject", "body"];

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
};
