"use client";

import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfoIcon, BrainCircuitIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

export default function LLMModelNode({
  data,
  id,
}: {
  data: {
    label: string;
    image?: string;
    preTemplateId?: string;
    onChange?: (id: string, data: any) => void;
    modelType?: string;
    systemPrompt?: string;
  };
  id: string;
}) {
  const [modelType, setModelType] = useState(data.modelType || "");
  const [systemPrompt, setSystemPrompt] = useState(data.systemPrompt || "");

  // Update parent component when data changes
  useEffect(() => {
    if (data.onChange) {
      data.onChange(id, {
        ...data,
        modelType,
        systemPrompt,
      });
    }
  }, [modelType, systemPrompt, id, data]);

  return (
    <Card className="w-[350px] shadow-md border-red-300">
      <CardHeader className="pb-2 bg-red-100 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {data.image ? (
              <img src={data.image} alt={data.label} className="h-5 w-5" />
            ) : (
              <BrainCircuitIcon className="h-5 w-5 text-red-600" />
            )}
            <CardTitle className="text-lg font-bold text-red-800">
              {data.label}
            </CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-5 w-5 text-red-600" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>
                  Select an LLM model and provide a system prompt to process the
                  scraped blog content.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`model-${id}`}>Select Model</Label>
            <Select value={modelType} onValueChange={setModelType}>
              <SelectTrigger id={`model-${id}`}>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gemini-1.5-flash">
                  Gemini 1.5 Flash
                </SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                <SelectItem value="llama-3">Llama 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`system-prompt-${id}`}>System Prompt</Label>
            <Textarea
              id={`system-prompt-${id}`}
              placeholder="You are an expert content summarizer. Extract the key points from the blog post."
              className="min-h-[100px]"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="w-3 h-3 bg-red-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="w-3 h-3 bg-red-500"
      />
    </Card>
  );
}
