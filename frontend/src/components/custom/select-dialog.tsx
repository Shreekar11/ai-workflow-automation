import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Webhook } from "lucide-react";
import { SiSolana } from "react-icons/si";

const triggerOptions = [
  {
    icon: <Webhook />,
    name: "Webhook",
    className: "bg-[#FF7801]/70 text-white hover:bg-[#FF7801]",
  },
];
const actionOptions = [
  {
    icon: <Mail />,
    name: "Send Email",
    className: "bg-[#FF5571]/80 text-white hover:bg-[#FF5571]",
  },
  {
    icon: <SiSolana />,
    name: "Send Solana",
    className: "bg-[#93BEFF]/80 text-white hover:bg-[#93BEFF]",
  },
];

export default function SelectDialog({
  isOpen,
  onClose,
  onSelect,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: string) => void;
  type: "trigger" | "action";
}) {
  const options = type === "trigger" ? triggerOptions : actionOptions;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Select {type === "trigger" ? "Trigger" : "Action"} Type
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {options.map((option, index) => (
            <Button
              key={index}
              onClick={() => onSelect(option.name)}
              className={option.className}
            >
              {option.icon} {option.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
