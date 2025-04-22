"use client";

import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Handle, Position } from "reactflow";
import { IoLogoLinkedin } from "react-icons/io5";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LinkedinScraperNode({
  data,
  id,
}: {
  data: {
    label: string;
    image?: string;
    preTemplateId?: string;
    onChange?: (id: string, data: any) => void;
    url?: string;
  };
  id: string;
}) {
  const [url, setUrl] = useState(data.url || "");

  useEffect(() => {
    if (data.onChange) {
      data.onChange(id, { ...data, url });
    }
  }, [url, id, data]);

  return (
    <Card className="w-[350px] shadow-md border-blue-300">
      <CardHeader className="pb-2 bg-blue-100 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoLogoLinkedin className="h-5 w-5 text-blue-600" />
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
                  Enter the URL of the LinkedIn company page you want
                  to scrape. The content will be sent to the LLM model for
                  processing.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`url-${id}`}>LinkedIn Company URL</Label>
            <Input
              id={`url-${id}`}
              placeholder="https://www.linkedin.com/company"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        className="w-3 h-3 bg-blue-500"
      />
    </Card>
  );
}
