import { useState, useEffect } from "react";
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
import { X, Plus, ChevronRight } from "lucide-react";
import { useAvailableTriggersActions } from "@/lib/hooks/useAvailableTriggersActions";
import { OptionType, Workflow } from "@/types";
import { Skeleton } from "../ui/skeleton";
import { optionStyles } from "@/constant";

interface NodeCardProps {
  workflow: Workflow | null;
  selectTrigger: {
    id: string;
    name: string;
    metadata: Record<string, string>;
  };
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: {
    id: string;
    type: string;
    name: string;
    metadata: Record<string, string>;
  }) => void;
  type: "trigger" | "action";
}

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
  const [metadata, setMetadata] = useState<Record<string, string>>({});

  const mappedOptions: OptionType[] = availableTriggerActions.map((item) => ({
    ...item,
    icon: optionStyles[item.name]?.icon || optionStyles.Email.icon,
  }));

  useEffect(() => {
    if (!isOpen) {
      setStage("select");
      setSelectedOption(null);
      setMetadata({});
    }
  }, [isOpen, type]);

  useEffect(() => {
    if (selectedOption && workflow) {
      if (type === "trigger") {
        setMetadata(workflow.trigger?.metadata || {});
      } else {
        const matchingAction = workflow.actions?.find(
          (action) => action.type.name === selectedOption.name
        );

        if (matchingAction) {
          setMetadata(matchingAction.metadata || {});
        } else {
          setMetadata(selectedOption.metadata || {});
        }
      }
    }
  }, [selectedOption, workflow, type]);

  const handleOptionSelect = (option: OptionType) => {
    setSelectedOption(option);
    setStage("configure");
    setMetadata(option.metadata || {});
  };

  const handleMetadataChange = (key: string, value: string) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddMetadata = () => {
    setMetadata((prev) => ({ ...prev, "": "" }));
  };

  const handleSubmit = () => {
    if (selectedOption) {
      const validMetadata = Object.fromEntries(
        Object.entries(metadata).filter(([key, value]) => key && value)
      );
      onSelect({
        id: selectedOption.id,
        type: type,
        name: selectedOption.name,
        metadata: validMetadata,
      });
      setStage("select");
      setSelectedOption(null);
      setMetadata({});
      onClose();
    }
  };

  const handleBack = () => {
    setStage("select");
    setSelectedOption(null);
    setMetadata({});
  };

  const handleClose = () => {
    setStage("select");
    setSelectedOption(null);
    setMetadata({});
    onClose();
  };

  const renderMetadataValue = (key: string, value: string) => {
    if (
      type === "action" &&
      Object.keys(selectTrigger?.metadata || {}).length > 0
    ) {
      return (
        <div className="space-y-2">
          <Select
            value={value || undefined}
            onValueChange={(newValue) => handleMetadataChange(key, newValue)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom Value</SelectItem>
              {Object.entries(selectTrigger.metadata).map(
                ([triggerKey, triggerValue]) => (
                  <SelectItem key={triggerKey} value={triggerValue}>
                    {triggerKey}: {triggerValue}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          {(!value || value === "custom") && (
            <Input
              placeholder="Custom value"
              value={value === "custom" ? "" : value}
              onChange={(e) => handleMetadataChange(key, e.target.value)}
            />
          )}
        </div>
      );
    }

    return (
      <Input
        placeholder="Value"
        value={value}
        onChange={(e) => handleMetadataChange(key, e.target.value)}
      />
    );
  };

  const renderMetadataExample = () => {
    if (type === "trigger" && Object.keys(metadata).length > 0) {
      const metadataObject = Object.fromEntries(
        Object.entries(metadata).filter(([key, value]) => key && value)
      );

      return (
        <div className="mt-4 space-y-2 pb-4">
          <h4 className="font-medium">Metadata Object Example:</h4>
          <div className="bg-gray-100 p-2 rounded max-h-40 overflow-auto">
            <pre className="text-sm whitespace-pre-wrap break-all">
              {JSON.stringify(metadataObject, null, 2)}
            </pre>
          </div>
        </div>
      );
    }
    return null;
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
    <Card className="bg-white w-[30rem] shadow-lg z-50 max-h-[90vh] flex flex-col">
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
      <CardContent className="flex-grow overflow-y-auto p-4">
        {stage === "select" && (
          <div className="space-y-2 pr-2">
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
          <div className="space-y-4 pr-2">
            <h3 className="font-medium">Metadata</h3>
            <div className="space-y-4">
              {Object.entries(metadata).map(([key, value], index) => (
                <div key={index} className="space-y-2">
                  <Input
                    placeholder="Key"
                    value={key}
                    onChange={(e) => {
                      const newMetadata = { ...metadata };
                      delete newMetadata[key];
                      newMetadata[e.target.value] = value;
                      setMetadata(newMetadata);
                    }}
                  />
                  {renderMetadataValue(key, value)}
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
            {renderMetadataExample()}
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
