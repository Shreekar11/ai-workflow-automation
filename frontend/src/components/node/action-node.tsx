"use client";

import { useEffect, useState } from "react";
import { Handle, Position } from "reactflow";
import {
  InfoIcon,
  PlayIcon,
  TableIcon,
  MailIcon,
  ClipboardCopyIcon,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";

export default function ActionNode({
  data,
}: {
  data: {
    label: string;
    selectedOption?: {
      name: string;
      image: string;
      metadata: any;
    };
    onActionTypeChange?: (
      actionId: string,
      actionName: string,
      metadata: Record<string, any>
    ) => void;
    onMetadataChange?: (
      actionId: string,
      metadata: Record<string, any>
    ) => void;
    nodeId: string;
    workflowId: string;
  };
}) {
  // Fetch the available Triggers to show in the Select Component
  const { loading, availableTriggerActions } =
    useAvailableTriggersActions("action");

  const [actionType, setActionType] = useState<string>("");
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  const [copied, setCopied] = useState(false);
  const serviceAccountEmail =
    "google-auth-service-account@workflow-automation-448218.iam.gserviceaccount.com";

  // Find the selected action from availableTriggerActions
  const selectedAction = availableTriggerActions.find(
    (action) => action.id === actionType
  );

  // Initialize component state when data changes or on first load
  useEffect(() => {
    if (data.selectedOption && data.selectedOption.name) {
      const action = availableTriggerActions.find(
        (a) => a.name === data.selectedOption?.name
      );

      if (action) {
        setActionType(action.id);
      }

      if (data.selectedOption.metadata) {
        const metadataObject = JSON.parse(
          JSON.stringify(data.selectedOption.metadata)
        );
        setMetadata(metadataObject);
      }
    }
  }, [data.selectedOption, availableTriggerActions]);

  const handleActionChange = (value: string) => {
    setActionType(value);

    const newMetadata = {};
    setMetadata(newMetadata);

    const action = availableTriggerActions.find((a) => a.id === value);

    // Send data back to parent component
    if (data.onActionTypeChange && action) {
      data.onActionTypeChange(value, action.name, newMetadata);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const updatedMetadata = {
      ...metadata,
      [field]: value,
    };

    setMetadata(updatedMetadata);

    // Send data back to parent component
    if (data.onMetadataChange) {
      data.onMetadataChange(data.nodeId, updatedMetadata);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(serviceAccountEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine colors based on selection state
  const getBorderColor = () => {
    if (!actionType) return "border-gray-300";
    return actionType.includes("google-sheets") ||
      selectedAction?.name === "Google Sheets"
      ? "border-green-400"
      : "border-red-400";
  };

  const getHeaderBgColor = () => {
    if (!actionType) return "bg-gray-100";
    return actionType.includes("google-sheets") ||
      selectedAction?.name === "Google Sheets"
      ? "bg-green-100"
      : "bg-red-100";
  };

  const getIconColor = () => {
    if (!actionType) return "text-gray-500";
    return actionType.includes("google-sheets") ||
      selectedAction?.name === "Google Sheets"
      ? "text-green-600"
      : "text-red-600";
  };

  const getTitleColor = () => {
    if (!actionType) return "text-gray-700";
    return actionType.includes("google-sheets") ||
      selectedAction?.name === "Google Sheets"
      ? "text-green-800"
      : "text-red-800";
  };

  const getHandleColor = () => {
    if (!actionType) return "bg-gray-400";
    return actionType.includes("google-sheets") ||
      selectedAction?.name === "Google Sheets"
      ? "bg-green-500"
      : "bg-red-500";
  };

  const getActionIcon = () => {
    if (
      actionType.includes("google-sheets") ||
      selectedAction?.name === "Google Sheets"
    ) {
      return <TableIcon className="h-4 w-4 text-green-500" />;
    } else if (
      actionType.includes("email") ||
      selectedAction?.name === "Email"
    ) {
      return <MailIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  // Determine which form to show based on selected action
  const getActionForm = () => {
    if (!selectedAction) return null;

    if (selectedAction.name === "Google Sheets") {
      return (
        <>
          <div className="space-y-3 bg-white rounded-md p-3 border border-green-200">
            <div className="space-y-1">
              <Label htmlFor="sheet-id" className="text-sm text-green-700">
                Sheet ID
              </Label>
              <Input
                id="sheet-id"
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                value={metadata.sheetId || ""}
                onChange={(e) => handleInputChange("sheetId", e.target.value)}
                className="border-green-200 focus-visible:ring-green-400"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="range" className="text-sm text-green-700">
                Range
              </Label>
              <Input
                id="range"
                placeholder="A1:D5"
                value={metadata.range || ""}
                onChange={(e) => handleInputChange("range", e.target.value)}
                className="border-green-200 focus-visible:ring-green-400"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="values" className="text-sm text-green-700">
                Values
              </Label>
              <Textarea
                id="values"
                placeholder="Enter values to add to sheet"
                value={metadata.values || ""}
                onChange={(e) => handleInputChange("values", e.target.value)}
                className="min-h-[80px] border-green-200 focus-visible:ring-green-400"
              />
            </div>
          </div>
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-xs text-green-800">
              <p className="font-medium mb-1">
                Important: Share access to your spreadsheet
              </p>
              <p className="mb-2">
                You must share your Google Sheet with editor access to the
                service account:
              </p>
              <div className="flex items-center gap-2 bg-white p-1.5 rounded border border-green-200 mb-1">
                <code className="text-xs text-green-700 flex-1 truncate">
                  {serviceAccountEmail}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-green-600 hover:text-green-800 hover:bg-green-100"
                  onClick={copyToClipboard}
                >
                  <ClipboardCopyIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs">
                {copied ? "Copied to clipboard!" : "Click the icon to copy"}
              </p>
            </AlertDescription>
          </Alert>
        </>
      );
    } else if (selectedAction.name === "Email") {
      return (
        <div className="space-y-3 bg-white rounded-md p-3 border border-red-200">
          <div className="space-y-1">
            <Label htmlFor="to" className="text-sm text-red-700">
              To
            </Label>
            <Input
              id="to"
              placeholder="recipient@example.com"
              value={metadata.to || ""}
              onChange={(e) => handleInputChange("to", e.target.value)}
              className="border-red-200 focus-visible:ring-red-400"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="from" className="text-sm text-red-700">
              From
            </Label>
            <Input
              id="from"
              placeholder="sender@example.com"
              value={metadata.from || ""}
              onChange={(e) => handleInputChange("from", e.target.value)}
              className="border-red-200 focus-visible:ring-red-400"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="subject" className="text-sm text-red-700">
              Subject
            </Label>
            <Input
              id="subject"
              placeholder="Email Subject"
              value={metadata.subject || ""}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              className="border-red-200 focus-visible:ring-red-400"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="body" className="text-sm text-red-700">
              Body
            </Label>
            <Textarea
              id="body"
              placeholder="Enter email body"
              value={metadata.body || ""}
              onChange={(e) => handleInputChange("body", e.target.value)}
              className="min-h-[100px] border-red-200 focus-visible:ring-red-400"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className={`w-[350px] shadow-md ${getBorderColor()}`}>
      <CardHeader className={`pb-2 rounded-t-lg ${getHeaderBgColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayIcon className={`h-5 w-5 ${getIconColor()}`} />
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
                <p>
                  Select an action type to perform at the end of your workflow.
                </p>
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
                {data.selectedOption?.image && (
                  <img
                    src={data.selectedOption?.image}
                    alt={data.selectedOption?.name}
                    className="h-4 w-4 object-contain"
                  />
                )}
                {data.selectedOption?.name}
              </div>
            ) : (
              <Select onValueChange={handleActionChange} value={actionType}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loading ? "Loading actions..." : "Select action type"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableTriggerActions.map((action) => (
                    <SelectItem key={action.id} value={action.id}>
                      <div className="flex items-center gap-2">
                        {action.image && (
                          <img
                            src={action.image}
                            alt={action.name}
                            className="h-4 w-4 object-contain"
                          />
                        )}
                        {action.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {actionType && selectedAction && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
                {getActionIcon()}
                <span className="break-words">{selectedAction.name}</span>
              </div>

              {getActionForm()}
            </div>
          )}
        </div>
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        className={`w-16 !${getHandleColor()}`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={`w-16 !${getHandleColor()}`}
      />
    </Card>
  );
}
