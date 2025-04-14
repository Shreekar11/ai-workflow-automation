"use client";

import { useEffect, useState } from "react";
import { Handle, Position } from "reactflow";
import { InfoIcon, RssIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BlogScraperNode({
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

  // Update parent component when url changes
  useEffect(() => {
    if (data.onChange) {
      data.onChange(id, { ...data, url: url });
    }
  }, [url, id, data]);

  return (
    <Card className="w-[300px] shadow-md border-amber-300">
      <CardHeader className="pb-2 bg-amber-100 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RssIcon className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg font-bold text-amber-800">
              {data.label}
            </CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-5 w-5 text-amber-600" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>
                  Enter the URL of the blog you want to scrape. The content will
                  be sent to the LLM model for processing.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`url-${id}`}>Blog URL</Label>
            <Input
              id={`url-${id}`}
              placeholder="https://example.com/blog-post"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="w-3 h-3 bg-amber-500"
      />
    </Card>
  );
}
