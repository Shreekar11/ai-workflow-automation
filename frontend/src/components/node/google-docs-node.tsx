"use client";

import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoIcon, FileTextIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

export default function GoogleDocsNode({
  data,
  id,
}: {
  data: {
    label: string;
    image?: string;
    preTemplateId?: string;
    onChange?: (id: string, data: any) => void;
    docId?: string;
  };
  id: string;
}) {
  const [docId, setDocId] = useState(data.docId || "");

  // Update parent component when docId changes
  useEffect(() => {
    if (data.onChange) {
      data.onChange(id, { ...data, docId });
    }
  }, [docId, id, data]);

  return (
    <Card className="w-[300px] shadow-md border-blue-300">
      <CardHeader className="pb-2 bg-blue-100 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {data.image ? (
              <img src={data.image} alt={data.label} className="h-5 w-5" />
            ) : (
              <FileTextIcon className="h-5 w-5 text-blue-600" />
            )}
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
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="w-3 h-3 bg-blue-500"
      />
    </Card>
  );
}
