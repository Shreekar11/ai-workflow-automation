// interfaces
import {
  ActionMetadataFieldsProps,
  MetadataDisplayProps,
  TriggerMetadataFieldsProps,
} from "@/types";

// clerk user
import { useUser } from "@clerk/nextjs";

// constants
import { EMAIL_FIELDS } from "@/constant";

// ui components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const MetadataDisplay = ({ type, metadata }: MetadataDisplayProps) => {
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

export const TriggerMetadataFields = ({
  metadata,
  errors,
  setMetadata,
  setErrors,
  handleMetadataChange,
}: TriggerMetadataFieldsProps) => {
  const handleAddMetadata = () => {
    setMetadata((prev) => ({ ...prev, "": "" }));
  };

  return (
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
};

export const ActionMetadataFields = ({
  selectedOption,
  metadata,
  customValues,
  errors,
  selectTrigger,
  handleMetadataChange,
  handleCustomValueChange,
}: ActionMetadataFieldsProps) => {
  const { user } = useUser();
  const defaultEmail = user?.emailAddresses?.[0]?.emailAddress || "";

  const getDisplayValue = (field: string, value: string) => {
    if (!value || !value.startsWith("{data.")) return value;

    const triggerKey = value.replace("{data.", "").replace("}", "");
    return selectTrigger?.metadata[triggerKey] || value;
  };

  const renderField = (field: string) => {
    const hasError = errors[field];
    const value = metadata[field];
    const customValue = customValues[field];
    const displayValue = getDisplayValue(field, value);

    if (field === "from") {
      return (
        <div className="flex flex-col space-y-2 justify-start items-start">
          <div>
            From <span className="text-destructive">*</span>
          </div>
          {Object.keys(selectTrigger?.metadata || {}).length > 0 ? (
            <div className="w-full space-y-2">
              <Select
                value={value || defaultEmail}
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
                  <SelectItem value={defaultEmail}>
                    {defaultEmail
                      ? `${defaultEmail} (Your email)`
                      : "No email available"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Input
              placeholder="Enter sender email"
              value={value || defaultEmail}
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
              value={value || ""}
              onValueChange={(newValue) => {
                if (newValue === "custom") {
                  handleMetadataChange(field, "");
                } else {
                  const triggerKey = Object.entries(
                    selectTrigger.metadata
                  ).find(([_, val]) => val === newValue)?.[0];
                  if (triggerKey) {
                    handleMetadataChange(field, `{data.${triggerKey}}`);
                  } else {
                    handleMetadataChange(field, newValue);
                  }
                }
              }}
            >
              <SelectTrigger
                className={`w-full ${hasError ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder={`Select ${field}`}>
                  {displayValue}
                </SelectValue>
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
                onChange={(e) => {
                  handleCustomValueChange(field, e.target.value);
                  handleMetadataChange(field, e.target.value);
                }}
                className={hasError ? "border-red-500" : ""}
              />
            )}
          </div>
        ) : (
          <Input
            placeholder={`Enter ${field}`}
            value={displayValue}
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

  return (
    <div className="space-y-6">
      {selectedOption.name === "Email" && EMAIL_FIELDS.map(renderField)}
    </div>
  );
};
