import { ReactNode } from "react";

// icons
import { SiSolana } from "react-icons/si";
import { Mail, Webhook } from "lucide-react";

// components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// actions
import { useAvailableTriggersActions } from "@/lib/hooks/useAvailableTriggersActions";

type OptionType = {
  id: string;
  name: string;
  image?: string;
  icon?: ReactNode;
  className?: string;
};

interface SelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: { id: string; type: string; name: string }) => void;
  type: "trigger" | "action";
};

const optionStyles: Record<string, { icon: ReactNode; className: string }> = {
  Webhook: {
    icon: <Webhook />,
    className: "bg-[#FF7801]/70 text-white hover:bg-[#FF7801]",
  },
  Email: {
    icon: <Mail />,
    className: "bg-[#FF5571]/80 text-white hover:bg-[#FF5571]",
  },
  Solana: {
    icon: <SiSolana />,
    className: "bg-[#93BEFF]/80 text-white hover:bg-[#93BEFF]",
  },
};

export default function SelectDialog({
  isOpen,
  onClose,
  onSelect,
  type,
}: SelectDialogProps) {
  const { loading, availableTriggerActions } =
    useAvailableTriggersActions(type);

  const mappedOptions: OptionType[] = availableTriggerActions.map((item) => {
    const style = optionStyles[item.name] || optionStyles.Email;
    return {
      ...item,
      icon: style.icon,
      className: style.className,
    };
  });

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full bg-gray-200" />
      <Skeleton className="h-10 w-full bg-gray-200" />
      <Skeleton className="h-10 w-full bg-gray-200" />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Select {type === "trigger" ? "Trigger" : "Action"} Type
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            mappedOptions.map((option, index) => (
              <Button
                key={option.id || index}
                onClick={() => onSelect({ id: option.id, type: type, name: option.name })}
                className={`flex items-center gap-2 py-6 ${option.className}`}
              >
                <span className="rounded-full bg-white/20 p-3">
                  {option.icon}
                </span>
                <span>{option.name}</span>
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
