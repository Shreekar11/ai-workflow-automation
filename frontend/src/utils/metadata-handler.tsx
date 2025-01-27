import React from "react";
import { Plus } from "lucide-react";
import { OptionType } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  EMAIL_FIELDS,
  EMAIL_VALIDATION_RULES,
  SHEETS_FIELDS,
  SHEETS_VALIDATION_RULES,
} from "@/constant";

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
  setErrors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  displayTrigger: any
) => {
  console.log(displayTrigger);
  const validationErrors: Record<string, boolean> = {};
  const errorMessages: Record<string, string> = {};
  let isValid = true;

  if (type === "trigger") {
    Object.entries(metadata).forEach(([key, value]) => {
      if (!value || value.trim() === "") {
        validationErrors[key] = true;
        errorMessages[key] = `${key} is required`;
        isValid = false;
      }
    });
  } else {
    const rules =
      selectedOption?.name === "Email"
        ? EMAIL_VALIDATION_RULES
        : SHEETS_VALIDATION_RULES;
    const fields =
      selectedOption?.name === "Email" ? EMAIL_FIELDS : SHEETS_FIELDS;

    if (
      selectedOption?.name === "Email" &&
      user?.emailAddresses?.[0]?.emailAddress
    ) {
      metadata.from = user.emailAddresses[0].emailAddress;
      displayTrigger.from = user.emailAddresses[0].emailAddress;
    }

    fields.forEach((field) => {
      const value = displayTrigger[field] || "";
      console.log(value);

      if (!rules[field].required && !value) {
        return;
      }

      if (rules[field].required && (!value || value.trim() === "")) {
        validationErrors[field] = true;
        errorMessages[field] = `${field} is required`;
        isValid = false;
        return;
      }

      if (rules[field].pattern && value && !rules[field].pattern.test(value)) {
        validationErrors[field] = true;
        errorMessages[field] = `Invalid ${field} format`;
        isValid = false;
        return;
      }

      if (
        rules[field].minLength &&
        value &&
        value.length < rules[field].minLength
      ) {
        validationErrors[field] = true;
        errorMessages[
          field
        ] = `${field} must be at least ${rules[field].minLength} characters`;
        isValid = false;
        return;
      }

      if (
        rules[field].maxLength &&
        value &&
        value.length > rules[field].maxLength
      ) {
        validationErrors[field] = true;
        errorMessages[
          field
        ] = `${field} cannot exceed ${rules[field].maxLength} characters`;
        isValid = false;
        return;
      }

      if (rules[field].custom && !rules[field].custom(value)) {
        validationErrors[field] = true;
        const customMessage =
          field === "values"
            ? "Invalid format. Values should be comma-separated without spaces"
            : `Invalid ${field} format`;
        errorMessages[field] = customMessage;
        isValid = false;
        return;
      }
    });

    if (
      selectedOption?.name === "Google Sheets" &&
      displayTrigger.range &&
      displayTrigger.values
    ) {
      const rangeMatch = displayTrigger.range.match(
        /[A-Z]+[0-9]+:[A-Z]+[0-9]+$/
      );
      if (rangeMatch) {
        const valueCount = displayTrigger.values.split(",").length;
        const [start, end] = rangeMatch[0].split(":");
        const startCol = start.match(/[A-Z]+/)?.[0];
        const endCol = end.match(/[A-Z]+/)?.[0];

        if (startCol && endCol) {
          const expectedColumns =
            endCol.charCodeAt(0) - startCol.charCodeAt(0) + 1;
          if (valueCount !== expectedColumns) {
            validationErrors.values = true;
            errorMessages.values = `Number of values (${valueCount}) does not match the range columns (${expectedColumns})`;
            isValid = false;
          }
        }
      }
    }
  }

  setErrors(validationErrors);
  return { isValid, errorMessages };
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
