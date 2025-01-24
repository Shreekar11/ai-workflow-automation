import { useEffect } from "react";
import { NodeCardProps, OptionType } from "@/types";
import { useAvailableTriggersActions } from "@/lib/hooks/useAvailableTriggersActions";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { optionStyles } from "@/constant";
import { Skeleton } from "@/components/ui/skeleton";
import { useNodeCardState } from "@/lib/hooks/useNode";
import {
  ActionMetadataFields,
  TriggerMetadataFields,
} from "./metadata-fields";

export default function NodeCard({
  workflow,
  selectTrigger,
  setSelectTrigger,
  finalTrigger,
  setFinalTrigger,
  isOpen,
  onClose,
  onSelect,
  type,
}: NodeCardProps) {
  const { loading, availableTriggerActions } =
    useAvailableTriggersActions(type);
  const {
    stage,
    selectedOption,
    metadata,
    setMetadata,
    displayTrigger,
    setDisplayTrigger,
    errors,
    setErrors,
    handleOptionSelect,
    handleMetadataChange,
    handleSubmit,
    resetForm,
    setStage,
  } = useNodeCardState({
    type,
    workflow,
    onSelect,
    onClose,
    selectTrigger,
    setSelectTrigger,
    finalTrigger,
    setFinalTrigger,
    isOpen,
  });

  const mappedOptions: OptionType[] = availableTriggerActions.map((item) => ({
    ...item,
    icon: optionStyles[item.name]?.icon || optionStyles.Email.icon,
  }));

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, type]);

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
        {stage === "select" ? (
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
        ) : (
          selectedOption && (
            <div className="space-y-6 pr-2 max-h-[60vh] flex-grow p-2 overflow-y-auto">
              {type === "trigger" ? (
                <>
                  <TriggerMetadataFields
                    metadata={metadata}
                    errors={errors}
                    setMetadata={setMetadata}
                    setErrors={setErrors}
                    handleMetadataChange={handleMetadataChange}
                  />
                </>
              ) : (
                <ActionMetadataFields
                  selectedOption={selectedOption}
                  metadata={metadata}
                  errors={errors}
                  setDisplayTrigger={setDisplayTrigger}
                  selectTrigger={selectTrigger}
                  setSelectTrigger={setSelectTrigger}
                  finalTrigger={finalTrigger}
                  setFinalTrigger={setFinalTrigger}
                  handleMetadataChange={handleMetadataChange}
                />
              )}
            </div>
          )
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
              className="bg-[#FF7801] text-white hover:bg-[#FF7801]/80 hover:text-white"
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
