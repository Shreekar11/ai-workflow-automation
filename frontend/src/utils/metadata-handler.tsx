import React from "react";
import { Plus } from "lucide-react";
import { OptionType } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EMAIL_FIELDS, SHEETS_FIELDS } from "@/constant";

export const initializeMetadata = (
  type: string,
  actionType: string,
  setMetadata: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
  if (type === "trigger") {
    setMetadata({});
  } else {
    const fields = actionType === "Email" ? EMAIL_FIELDS : SHEETS_FIELDS;
    const initialMetadata = fields.reduce(
      (acc, field) => ({
        ...acc,
        [field]: "",
      }),
      {}
    );
    setMetadata(initialMetadata);
  }
};

export const validateForm = (
  user: any,
  type: string,
  metadata: Record<string, string>,
  selectedOption: OptionType,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
) => {
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
      selectedOption?.name === "Email" ? EMAIL_FIELDS : SHEETS_FIELDS;
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    if (
      selectedOption?.name === "Email" &&
      user?.emailAddresses?.[0]?.emailAddress
    ) {
      metadata.from = user.emailAddresses[0].emailAddress;
    }

    fields.forEach((field) => {
      const value = metadata[field];

      if (!value) {
        newErrors[field] = true;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }
};

export const renderMetadataExample = (type: string, metadata: any) => {
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

export const renderTriggerMetadata = (
  metadata: Record<string, string>,
  errors: Record<string, boolean>,
  setMetadata: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  handleMetadataChange: (key: string, value: string) => void
) => {
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
            type="text"
            placeholder="Value"
            value={value as string}
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
