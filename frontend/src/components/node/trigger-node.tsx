"use client";

import { Handle, Position } from "reactflow";
import { InfoIcon, Webhook, ZapIcon } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useAvailableTriggersActions } from "@/lib/hooks/useAvailableTriggersActions";

// ui components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TriggerNodeProps {
  data: {
    label: string;
    selectedOption?: {
      icon: ReactNode;
      metadata: any;
      name: string;
    };
    onTriggerTypeChange?: (
      triggerId: string,
      triggerName: string,
      metadata: Record<string, any>
    ) => void;
    onMetadataChange?: (metadata: Record<string, any>) => void;
    workflowId: string;
  };
}

export default function TriggerNode({ data }: TriggerNodeProps) {
  // Fetch the available Triggers to show in the Select Component
  const { loading, availableTriggerActions } =
    useAvailableTriggersActions("trigger");

  const [triggerType, setTriggerType] = useState<string>("");
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  // Find the selected trigger from availableTriggerActions data
  const selectedTrigger = availableTriggerActions.find(
    (trigger) => trigger.id === triggerType
  );

  // Initialize component state when data changes or on first load
  useEffect(() => {
    if (data.selectedOption && data.selectedOption.name) {
      const trigger = availableTriggerActions.find(
        (t) => t.name === data.selectedOption?.name
      );

      if (trigger) {
        setTriggerType(trigger.id);
      }

      if (data.selectedOption.metadata) {
        const metadataObject = Object.fromEntries(
          Object.entries(data.selectedOption.metadata).filter(
            ([key, value]) => key && value
          )
        );
        setMetadata(metadataObject);

        if (data.onMetadataChange) {
          data.onMetadataChange(metadataObject);
        }
      }
    }
  }, [data.selectedOption, availableTriggerActions]);

  // Set webhook metadata when webhook is selected
  const handleTriggerChange = (value: string) => {
    setTriggerType(value);

    // Find the selected trigger
    const trigger = availableTriggerActions.find((t) => t.id === value);
    let newMetadata = {};

    if (trigger && trigger.name === "Webhook") {
      // Example webhook metadata
      newMetadata = {
        URL: `${process.env.NEXT_PUBLIC_WEBHOOK_URL}/hooks/${
          data.workflowId ? data.workflowId : ""
        }`,
        Method: "POST",
        Headers: "Content-Type: application/json",
      };
    }

    setMetadata(newMetadata);

    // Send data back to parent component
    if (data.onTriggerTypeChange && trigger) {
      data.onTriggerTypeChange(value, trigger.name, newMetadata);
    }
  };

  const getBorderColor = () =>
    triggerType ? "border-purple-400" : "border-gray-300";
  const getHeaderBgColor = () =>
    triggerType ? "bg-purple-100" : "bg-gray-100";
  const getIconColor = () =>
    triggerType ? "text-purple-600" : "text-gray-500";
  const getTitleColor = () =>
    triggerType ? "text-purple-800" : "text-gray-700";
  const getHandleColor = () => (triggerType ? "bg-purple-500" : "bg-gray-400");

  const getTriggerIcon = () => {
    if (selectedTrigger?.name === "Webhook") {
      return <Webhook className="h-4 w-4 text-purple-500" />;
    }
    return null;
  };

  return (
    <Card className={`w-[350px] shadow-md ${getBorderColor()}`}>
      <CardHeader className={`pb-2 rounded-t-lg ${getHeaderBgColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ZapIcon className={`h-5 w-5 ${getIconColor()}`} />
            <CardTitle className={`text-lg font-bold ${getTitleColor()}`}>
              {data.label}
            </CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className={`h-5 w-5 ${getIconColor()}`} />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>Select a trigger type to start your workflow.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            {data.workflowId ? (
              <div className="border rounded-lg px-2 py-1 shadow-sm flex items-center gap-2">
                {data.selectedOption?.name === "Webhook" && <Webhook />}
                {data.selectedOption?.name}
              </div>
            ) : (
              <Select onValueChange={handleTriggerChange} value={triggerType}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loading ? "Loading triggers..." : "Select trigger type"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableTriggerActions.map((trigger) => (
                    <SelectItem key={trigger.id} value={trigger.id}>
                      <div className="flex items-center gap-2">
                        {trigger.image && trigger.name !== "Webhook" ? (
                          <img
                            src={trigger.image}
                            alt={trigger.name}
                            className="h-4 w-4 object-contain"
                          />
                        ) : (
                          <Webhook size={15} />
                        )}
                        {trigger.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {triggerType && selectedTrigger && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
                {getTriggerIcon()}
                <span className="break-words">{selectedTrigger.name}</span>
              </div>
              {Object.keys(metadata).length > 0 && (
                <div className="bg-white rounded-md p-2 text-sm space-y-1 max-h-[200px] overflow-y-auto border border-gray-200">
                  {Object.entries(metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-[1fr,2fr] gap-4 items-start"
                    >
                      <span className="text-gray-600 font-medium">{key}:</span>
                      <span className="text-gray-800 break-words">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <Handle
        type="source"
        position={Position.Bottom}
        className={`w-16 !${getHandleColor()}`}
      />
    </Card>
  );
}
