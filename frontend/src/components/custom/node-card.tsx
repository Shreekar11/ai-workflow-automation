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
import { useUser } from "@clerk/nextjs";

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

const EMAIL_FIELDS = ["to", "from", "subject", "body"];
const SOLANA_FIELDS = ["to", "amount"];

export default function NodeCard({
  workflow,
  selectTrigger,
  isOpen,
  onClose,
  onSelect,
  type,
}: NodeCardProps) {
  const { user } = useUser();
  const { loading, availableTriggerActions } =
    useAvailableTriggersActions(type);
  const [stage, setStage] = useState<"select" | "configure">("select");
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const mappedOptions: OptionType[] = availableTriggerActions.map((item) => ({
    ...item,
    icon: optionStyles[item.name]?.icon || optionStyles.Email.icon,
  }));

  useEffect(() => {
    if (!isOpen) {
      resetForm();
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
          initializeMetadata(selectedOption.name);
        }
      }
    }
  }, [selectedOption, workflow, type]);

  const initializeMetadata = (actionType: string) => {
    if (type === "trigger") {
      setMetadata({});
    } else {
      const fields = actionType === "Email" ? EMAIL_FIELDS : SOLANA_FIELDS;
      const initialMetadata = fields.reduce(
        (acc, field) => ({
          ...acc,
          [field]: "",
        }),
        {}
      );
      setMetadata(initialMetadata);
      setCustomValues({});
    }
  };

  const resetForm = () => {
    setStage("select");
    setSelectedOption(null);
    setMetadata({});
    setCustomValues({});
    setErrors({});
  };

  const validateForm = () => {
    if (type === "trigger") {
      const newErrors: Record<string, boolean> = {};
      let isValid = true;

      Object.entries(metadata).forEach(([key, value]) => {
        if (!key || !value) {
          newErrors[key] = true;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    } else {
      const fields =
        selectedOption?.name === "Email" ? EMAIL_FIELDS : SOLANA_FIELDS;
      const newErrors: Record<string, boolean> = {};
      let isValid = true;

      fields.forEach((field) => {
        const value = metadata[field];
        if (!value || (value === "custom" && !customValues[field])) {
          newErrors[field] = true;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    }
  };

  const handleOptionSelect = (option: OptionType) => {
    setSelectedOption(option);
    setStage("configure");
    initializeMetadata(option.name);
  };

  const handleMetadataChange = (key: string, value: string) => {
    if (value === "custom") {
      setMetadata((prev) => ({ ...prev, [key]: value }));
      setCustomValues((prev) => ({ ...prev, [key]: "" }));
    } else {
      setMetadata((prev) => ({ ...prev, [key]: value }));
      setCustomValues((prev) => {
        const newValues = { ...prev };
        delete newValues[key];
        return newValues;
      });
    }
    setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const handleCustomValueChange = (key: string, value: string) => {
    setCustomValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const handleAddMetadata = () => {
    setMetadata((prev) => ({ ...prev, "": "" }));
  };

  const handleSubmit = () => {
    if (selectedOption && validateForm()) {
      let finalMetadata: Record<string, string>;

      if (type === "trigger") {
        finalMetadata = Object.fromEntries(
          Object.entries(metadata).filter(([key, value]) => key && value)
        );
      } else {
        finalMetadata = Object.entries(metadata).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: value === "custom" ? customValues[key] : value,
          }),
          {}
        );
      }

      onSelect({
        id: selectedOption.id,
        type: type,
        name: selectedOption.name,
        metadata: finalMetadata,
      });
      resetForm();
      onClose();
    }
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

  const renderTriggerMetadata = () => (
    <div className="space-y-4">
      {Object.entries(metadata).map(([key, value], index) => (
        <div key={index} className="space-y-2">
          <Input
            placeholder="Key"
            value={key}
            className={errors[key] ? "border-red-500" : ""}
            onChange={(e) => {
              const newMetadata = { ...metadata };
              delete newMetadata[key];
              newMetadata[e.target.value] = value;
              setMetadata(newMetadata);
              setErrors((prev) => ({ ...prev, [key]: false }));
            }}
          />
          <Input
            placeholder="Value"
            value={value}
            className={errors[key] ? "border-red-500" : ""}
            onChange={(e) => handleMetadataChange(key, e.target.value)}
          />
          {errors[key] && (
            <p className="text-sm text-destructive">
              Both key and value are required
            </p>
          )}
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
  );

  const renderActionMetadataField = (field: string) => {
    const hasError = errors[field];
    const value = metadata[field];
    const customValue = customValues[field];

    if (field === "from") {
      return (
        <div className="flex flex-col space-y-2 justify-start items-start">
          <div>
            From <span className="text-destructive">*</span>
          </div>
          {Object.keys(selectTrigger?.metadata || {}).length > 0 ? (
            <div className="w-full space-y-2">
              <Select
                value={value || user?.emailAddresses[0].emailAddress}
                onValueChange={(newValue) =>
                  handleMetadataChange(field, newValue)
                }
              >
                <SelectTrigger
                  className={`w-full ${hasError ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select sender email" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={user?.emailAddresses[0].emailAddress || ""}
                  >
                    {user?.emailAddresses[0].emailAddress} (Your email)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Input
              placeholder="Enter sender email"
              value={value || user?.emailAddresses[0].emailAddress}
              onChange={(e) => handleMetadataChange(field, e.target.value)}
              className={`w-full ${hasError ? "border-red-500" : ""}`}
            />
          )}
          {hasError && (
            <p className="text-sm text-destructive">This field is required</p>
          )}
        </div>
      );
    }

    return (
      <div key={field} className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1">
          {field.charAt(0).toUpperCase() + field.slice(1)}
          <span className="text-destructive">*</span>
        </label>
        {Object.keys(selectTrigger?.metadata || {}).length > 0 ? (
          <div className="space-y-2">
            <Select
              value={value || undefined}
              onValueChange={(newValue) =>
                handleMetadataChange(field, newValue)
              }
            >
              <SelectTrigger
                className={`w-full ${hasError ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder={`Select ${field}`} />
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
            {value === "custom" && (
              <Input
                placeholder={`Enter custom ${field}`}
                value={customValue || ""}
                onChange={(e) => handleCustomValueChange(field, e.target.value)}
                className={hasError ? "border-red-500" : ""}
              />
            )}
          </div>
        ) : (
          <Input
            placeholder={`Enter ${field}`}
            value={value || ""}
            onChange={(e) => handleMetadataChange(field, e.target.value)}
            className={hasError ? "border-red-500" : ""}
          />
        )}
        {hasError && (
          <p className="text-sm text-destructive">This field is required</p>
        )}
      </div>
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

  return (
    <Card className="bg-white w-[30rem] shadow-lg z-50 max-h-[90vh] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {stage === "select"
            ? `Select ${type.charAt(0).toUpperCase() + type.slice(1)} Type`
            : `Configure ${selectedOption?.name}`}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
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
          <div className="space-y-6 pr-2 max-h-[60vh] flex-grow p-2 overflow-y-auto">
            {type === "trigger" ? (
              <>
                <h3 className="font-medium">Metadata</h3>
                {renderTriggerMetadata()}
                {renderMetadataExample()}
              </>
            ) : (
              <div className="space-y-6">
                {selectedOption.name === "Email" &&
                  EMAIL_FIELDS.map(renderActionMetadataField)}
                {selectedOption.name === "Solana" &&
                  SOLANA_FIELDS.map(renderActionMetadataField)}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {stage === "configure" ? (
          <>
            <Button
              onClick={() => setStage("select")}
              variant="outline"
              size="sm"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              size="sm"
              className="bg-[#FF7801] text-white 
              hover:bg-[#FF7801]/80 hover:text-white"
            >
              Confirm
            </Button>
          </>
        ) : (
          <Button
            onClick={onClose}
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
