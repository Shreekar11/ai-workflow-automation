import { ReactNode } from "react";
import { SiSolana } from "react-icons/si";
import { Clock, Mail, Webhook } from "lucide-react";

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
