import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

// interfaces
import { NodeCardProps, OptionType } from "@/types";

// utility classes
import { initializeMetadata, validateForm } from "@/utils/metadata-handler";

export const useNodeCardState = ({
  type,
  workflow,
  onSelect,
  onClose,
}: NodeCardProps) => {
  const { user } = useUser();
  const [stage, setStage] = useState<"select" | "configure">("select");
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});

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
          initializeMetadata(
            type,
            selectedOption.name,
            setMetadata,
            setCustomValues
          );
        }
      }
    }
  }, [selectedOption, workflow, type]);

  const resetForm = () => {
    setStage("select");
    setSelectedOption(null);
    setMetadata({});
    setCustomValues({});
    setErrors({});
  };

  const handleOptionSelect = (option: OptionType) => {
    setSelectedOption(option);
    setStage("configure");
    initializeMetadata(type, option.name, setMetadata, setCustomValues);
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

  const handleSubmit = () => {
    if (
      selectedOption &&
      validateForm(
        user,
        type,
        metadata,
        selectedOption,
        customValues,
        setErrors
      )
    ) {
      const finalMetadata =
        type === "trigger"
          ? Object.fromEntries(
              Object.entries(metadata).filter(([key, value]) => key && value)
            )
          : Object.entries(metadata).reduce(
              (acc, [key, value]) => ({
                ...acc,
                [key]: value === "custom" ? customValues[key] : value,
              }),
              {}
            );

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

  return {
    stage,
    selectedOption,
    metadata,
    setMetadata,
    customValues,
    errors,
    setErrors,
    handleOptionSelect,
    handleMetadataChange,
    handleCustomValueChange,
    handleSubmit,
    resetForm,
    setStage,
  };
};
