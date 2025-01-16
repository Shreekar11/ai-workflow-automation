import { ReactNode } from "react";
import { SiSolana } from "react-icons/si";
import { Clock, Mail, Webhook } from "lucide-react";

export const EMAIL_FIELDS = ["to", "from", "subject", "body"];
export const SOLANA_FIELDS = ["to", "amount"];

export const optionStyles: Record<string, { icon: ReactNode }> = {
  Webhook: {
    icon: <Webhook />,
  },
  Email: {
    icon: <Mail />,
  },
  Solana: {
    icon: <SiSolana />,
  },
  Schedule: {
    icon: <Clock />,
  },
};
