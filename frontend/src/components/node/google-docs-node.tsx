"use client";

import { useEffect, useState } from "react";
import { Handle, Position } from "reactflow";
import { InfoIcon, FileTextIcon, ClipboardCopyIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GoogleDocsNode({
  data,
  id,
}: {
  data: {
    label: string;
    image?: string;
    preTemplateId?: string;
    onChange?: (id: string, data: any) => void;
    googleDocsId?: string;
  };
  id: string;
}) {
  const [copied, setCopied] = useState(false);
  const serviceAccountEmail =
    "google-auth-service-account@workflow-automation-448218.iam.gserviceaccount.com";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(serviceAccountEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const [googleDocsId, setgoogleDocsId] = useState(data.googleDocsId || "");

  // Update parent component when googleDocsId changes
  useEffect(() => {
    if (data.onChange) {
      data.onChange(id, { ...data, googleDocsId });
    }
  }, [googleDocsId, id, data]);

  return (
    <Card className="w-[350px] shadow-md border-blue-300">
      <CardHeader className="pb-2 bg-blue-100 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-blue-800">
              {data.label}
            </CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-5 w-5 text-blue-600" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>
                  Enter the Google Docs ID where the processed content will be
                  saved. You can find this ID in the URL of your Google Doc.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`doc-id-${id}`}>Google Docs ID</Label>
            <Input
              id={`doc-id-${id}`}
              placeholder="1a2b3c4d5e6f7g8h9i0j"
              value={googleDocsId}
              onChange={(e) => setgoogleDocsId(e.target.value)}
            />

            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-xs text-blue-800">
                <p className="font-medium mb-1">
                  Important: Share access to your document
                </p>
                <p className="mb-2">
                  You must share your Google Doc with editor access to the
                  service account:
                </p>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded border border-blue-200 mb-1">
                  <code className="text-xs text-blue-700 flex-1 truncate">
                    {serviceAccountEmail}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
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
          </div>
        </div>
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        className="w-3 h-3 bg-blue-500"
      />
    </Card>
  );
}
