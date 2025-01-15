import { ReactNode, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, ChevronRight, Webhook, Mail, Clock } from "lucide-react";
import { useAvailableTriggersActions } from "@/lib/hooks/useAvailableTriggersActions";
import { SiSolana } from "react-icons/si";
import { Workflow } from "@/types";
import { Skeleton } from "../ui/skeleton";

interface OptionType {
  id: string;
  name: string;
  image?: string;
  icon?: ReactNode;
  metadata?: { key: string; value: string }[];
}

interface Metadata {
  key: string;
  value: string;
}

interface NodeCardProps {
  workflow: Workflow | null;
  selectTrigger: {
    id: string;
    name: string;
    metadata: Metadata[];
  };
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: {
    id: string;
    type: string;
    name: string;
    metadata: Metadata[];
  }) => void;
  type: "trigger" | "action";
}

const optionStyles: Record<string, { icon: ReactNode }> = {
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

export default function NodeCard({
  workflow,
  selectTrigger,
  isOpen,
  onClose,
  onSelect,
  type,
}: NodeCardProps) {
  const { loading, availableTriggerActions } =
    useAvailableTriggersActions(type);

  const [stage, setStage] = useState<"select" | "configure">("select");
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
  const [metadata, setMetadata] = useState<Metadata[]>([]);

  const mappedOptions: OptionType[] = availableTriggerActions.map((item) => ({
    ...item,
    icon: optionStyles[item.name]?.icon || optionStyles.Email.icon,
  }));

  useEffect(() => {
    if (!isOpen) {
      setStage("select");
      setSelectedOption(null);
      setMetadata([]);
    }
  }, [isOpen, type]);

  useEffect(() => {
    if (selectedOption && workflow) {
      if (type === "trigger") {
        const triggerMetadata = workflow.trigger?.metadata || [];
        setMetadata(
          triggerMetadata.map((m: any) => ({
            key: m.key,
            value: "",
          }))
        );
      } else {
        const matchingAction = workflow.actions?.find(
          (action) => action.type.name === selectedOption.name
        );

        if (matchingAction) {
          setMetadata(matchingAction.metadata || []);
        } else {
          setMetadata(
            selectedOption.metadata?.map((m) => ({ key: m.key, value: "" })) ||
              []
          );
        }
      }
    }
  }, [selectedOption, workflow, type]);

  const handleOptionSelect = (option: OptionType) => {
    setSelectedOption(option);
    setStage("configure");
    if (option.metadata) {
      setMetadata(option.metadata.map((m) => ({ key: m.key, value: "" })));
    }
  };

  const handleMetadataChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    setMetadata((prev) => {
      const updated = [...prev];
      if (!updated[index]) {
        updated[index] = { key: "", value: "" };
      }
      updated[index][field] = value;
      return updated;
    });
  };

  const handleAddMetadata = () => {
    setMetadata((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      const validMetadata = metadata.filter((m) => m.key && m.value);
      onSelect({
        id: selectedOption.id,
        type: type,
        name: selectedOption.name,
        metadata: validMetadata,
      });
      setStage("select");
      setSelectedOption(null);
      setMetadata([]);
      onClose();
    }
  };

  const handleBack = () => {
    setStage("select");
    setSelectedOption(null);
    setMetadata([]);
  };

  const handleClose = () => {
    setStage("select");
    setSelectedOption(null);
    setMetadata([]);
    onClose();
  };

  const renderMetadataValue = (item: Metadata, index: number) => {
    if (type === "action" && selectTrigger?.metadata?.length > 0) {
      return (
        <div className="space-y-2">
          <Select
            value={item.value || undefined}
            onValueChange={(value) =>
              handleMetadataChange(index, "value", value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom Value</SelectItem>
              {selectTrigger.metadata.map((triggerMeta) => (
                <SelectItem
                  key={triggerMeta.key}
                  value={`{{trigger.${triggerMeta.key}}}`}
                >
                  Trigger: {triggerMeta.key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(!item.value || item.value === "custom") && (
            <Input
              placeholder="Custom value"
              value={item.value === "custom" ? "" : item.value}
              onChange={(e) =>
                handleMetadataChange(index, "value", e.target.value)
              }
            />
          )}
        </div>
      );
    }

    return (
      <Input
        placeholder="Value"
        value={item.value}
        onChange={(e) => handleMetadataChange(index, "value", e.target.value)}
      />
    );
  };

  if (!isOpen) return null;

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full bg-gray-200" />
      <Skeleton className="h-10 w-full bg-gray-200" />
      <Skeleton className="h-10 w-full bg-gray-200" />
    </div>
  );

  const capitalFirst = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <Card className="bg-white w-[30rem] shadow-lg z-50 overflow-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {stage === "select"
            ? `Select ${capitalFirst(type)} Type`
            : `Configure ${selectedOption?.name}`}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {stage === "select" && (
          <div className="space-y-2">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              mappedOptions.map((option) => (
                <Button
                  key={option.id}
                  onClick={() => handleOptionSelect(option)}
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span className="flex justify-center items-center gap-4">
                    <span className="rounded-full bg-white/20 p-3">
                      {option.icon}
                    </span>
                    {option.name}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ))
            )}
          </div>
        )}

        {stage === "configure" && selectedOption && (
          <div className="space-y-4 overflow-y-auto">
            <h3 className="font-medium">Metadata</h3>
            <div className="space-y-4">
              {metadata.map((item, index) => (
                <div key={index} className="space-y-2">
                  <Input
                    placeholder="Key"
                    value={item.key}
                    onChange={(e) =>
                      handleMetadataChange(index, "key", e.target.value)
                    }
                  />
                  {renderMetadataValue(item, index)}
                </div>
              ))}
              <Button
                onClick={handleAddMetadata}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Metadata
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {stage === "configure" ? (
          <>
            <Button onClick={handleBack} variant="outline" size="sm">
              Back
            </Button>
            <Button onClick={handleSubmit} size="sm">
              Confirm
            </Button>
          </>
        ) : (
          <Button
            onClick={handleClose}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
