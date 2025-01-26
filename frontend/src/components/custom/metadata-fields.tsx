// interfaces
import {
  ActionMetadataFieldsProps,
  MetadataDisplayProps,
  TriggerMetadataFieldsProps,
} from "@/types";

// clerk user
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "@/lib/hooks/useToast";

// constants
import {
  EMAIL_FIELDS,
  SHEETS_FIELDS,
  getPlaceholder,
  FIELD_DESCRIPTIONS,
} from "@/constant";

// ui components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, HelpCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  errors,
  setDisplayTrigger,
  selectTrigger,
  setSelectTrigger,
  finalTrigger,
  setFinalTrigger,
  handleMetadataChange,
}: ActionMetadataFieldsProps) => {
  const { user } = useUser();
  const defaultEmail = user?.emailAddresses?.[0]?.emailAddress || "";
  const [customInputs, setCustomInputs] = useState<Record<string, boolean>>({});

  const codeContent =
    "google-auth-service-account@workflow-automation-448218.iam.gserviceaccount.com";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      toast({
        title: "Copied!",
        description: "The email has been copied to your clipboard.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy the email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDisplayValue = (field: string, value: string) => {
    if (!value || !value.startsWith("{data.")) return value;
    const referencedField = value.replace("{data.", "").replace("}", "");
    return finalTrigger?.metadata[field] || value;
  };

  const handleCustomValueChange = (field: string, value: string) => {
    handleMetadataChange(
      field,
      `{data.${field}}`,
      (key: string, val: string) => {
        setDisplayTrigger((prev) => ({
          ...prev,
          [key]: value,
        }));
        setCustomInputs((prev) => ({ ...prev, [field]: true }));
      }
    );

    if (setFinalTrigger) {
      setFinalTrigger((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [field]: value,
        },
      }));
    }
  };

  const renderField = (field: string) => {
    const hasError = errors[field];
    const value = metadata[field];
    const displayValue = getDisplayValue(field, value);
    const isCustomValue = customInputs[field];

    const fieldDescription =
      selectedOption.name === "Google Sheets"
        ? FIELD_DESCRIPTIONS.sheets[field]
        : FIELD_DESCRIPTIONS.email[field];

    if (field === "from") {
      return (
        <div
          key={field}
          className="flex flex-col space-y-2 justify-start items-start"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1">
                <div>
                  From <span className="text-destructive">*</span>
                </div>
                <HelpCircle className="h-4 w-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                {fieldDescription}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {Object.keys(selectTrigger?.metadata || {}).length > 0 ? (
            <div className="w-full space-y-2">
              <Select
                value={value || defaultEmail}
                onValueChange={(newValue) =>
                  handleMetadataChange(field, newValue, (key) => {
                    setDisplayTrigger((prev) => ({
                      ...prev,
                      [key]: newValue,
                    }));
                  })
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
              placeholder={getPlaceholder(selectedOption, field)}
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <label className="text-sm font-medium">
                {field.charAt(0).toUpperCase() + field.slice(1)}
                <span className="text-destructive">*</span>
              </label>
              <HelpCircle className="h-4 w-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              {fieldDescription}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {Object.keys(selectTrigger?.metadata || {}).length > 0 ? (
          <div className="space-y-2">
            <Select
              value={isCustomValue ? "custom" : value || ""}
              onValueChange={(newValue) => {
                if (newValue === "custom") {
                  handleMetadataChange(field, newValue, (key) => {
                    setCustomInputs((prev) => ({ ...prev, [key]: true }));
                    setDisplayTrigger((prev) => ({
                      ...prev,
                      [key]: newValue,
                    }));
                  });
                } else {
                  handleMetadataChange(field, `{data.${field}}`, (key) => {
                    setCustomInputs((prev) => ({ ...prev, [key]: false }));
                    setDisplayTrigger((prev) => ({
                      ...prev,
                      [key]: newValue,
                    }));
                  });

                  if (setFinalTrigger) {
                    setFinalTrigger((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        [field]: newValue,
                      },
                    }));
                  }
                }
              }}
            >
              <SelectTrigger
                className={`w-full ${hasError ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder={`Select ${field}`}>
                  {isCustomValue ? "Custom Value" : displayValue}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(selectTrigger.metadata).map(([key, val]) => (
                  <SelectItem key={key} value={val}>
                    {key}: {val}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Value</SelectItem>
              </SelectContent>
            </Select>
            {isCustomValue && (
              <Input
                placeholder={getPlaceholder(selectedOption, field)}
                value={finalTrigger?.metadata[field] || ""}
                onChange={(e) => handleCustomValueChange(field, e.target.value)}
                className={hasError ? "border-red-500" : ""}
              />
            )}
          </div>
        ) : (
          <Input
            placeholder={getPlaceholder(selectedOption, field)}
            value={displayValue}
            onChange={(e) =>
              handleMetadataChange(field, e.target.value, (key, val) => {
                setDisplayTrigger((prev) => ({
                  ...prev,
                  [key]: val,
                }));
              })
            }
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
      {selectedOption.name === "Google Sheets" && (
        <>
          {SHEETS_FIELDS.map(renderField)}
          <Alert className="bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Please add the following service account email to your Google
              Sheet and grant it Editor permissions:
              <div className="relative mt-2">
                <code
                  onClick={copyToClipboard}
                  className="hover:cursor-pointer block p-2 pr-10 hover:bg-yellow-200 bg-yellow-100 rounded-lg overflow-x-auto"
                >
                  {codeContent}
                </code>
              </div>
              This step is crucial for automating the workflow with your Google
              Sheet.
            </AlertDescription>
          </Alert>
        </>
      )}
      {selectedOption.name === "Email" && EMAIL_FIELDS.map(renderField)}
    </div>
  );
};
