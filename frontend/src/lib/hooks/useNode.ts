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
          initializeMetadata(type, selectedOption.name, setMetadata);
        }
      }
    }
  }, [selectedOption, workflow, type]);

  const resetForm = () => {
    setStage("select");
    setSelectedOption(null);
    setMetadata({});
    setErrors({});
  };

  const handleOptionSelect = (option: OptionType) => {
    setSelectedOption(option);
    setStage("configure");
    initializeMetadata(type, option.name, setMetadata);
  };

  const handleMetadataChange = (key: string, value: string) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const handleSubmit = () => {
    if (
      selectedOption &&
      validateForm(user, type, metadata, selectedOption, setErrors)
    ) {
      const finalMetadata =
        type === "trigger"
          ? Object.fromEntries(
              Object.entries(metadata).filter(([key, value]) => key && value)
            )
          : metadata;

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
    errors,
    setErrors,
    handleOptionSelect,
    handleMetadataChange,
    handleSubmit,
    resetForm,
    setStage,
  };
};