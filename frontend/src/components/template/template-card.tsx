"use client";

import Link from "next/link";
import { useState } from "react";
import type { PreTemplateType } from "@/types";
import { BrainCircuit, File, FileText, RssIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export default function TemplateCard({
  template,
}: {
  template: PreTemplateType;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const renderNode = (node: any, index: number, isLast: boolean) => {
    switch (node.name) {
      case "Scraper":
        return (
          <div className="flex items-center">
            <RssIcon className="h-5 w-5 text-amber-600" />
            {!isLast && <div className="h-px w-4 bg-gray-300 mx-1" />}
          </div>
        );
      case "LLM Model":
        return (
          <div className="flex items-center">
            <BrainCircuit className="h-5 w-5 text-red-600" />
            {!isLast && <div className="h-px w-4 bg-gray-300 mx-1" />}
          </div>
        );
      case "Google Docs":
        return (
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-600" />
            {!isLast && <div className="h-px w-4 bg-gray-300 mx-1" />}
          </div>
        );
      default:
        // Fallback to a generic icon
        return (
          <div className="flex items-center">
            <File className="h-5 w-5 text-gray-600" />
            {!isLast && <div className="h-px w-4 bg-gray-300 mx-1" />}
          </div>
        );
    }
  };

  return (
    <Card
      className="overflow-hidden transition-all duration-300 border-border/60 hover:border-[#FF7801]/50 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold">
              {template.name}
            </CardTitle>
            <CardDescription className="mt-1.5 line-clamp-2">
              {template.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {template.availableTemplateActions.map(
              (node: any, index: number) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        {renderNode(
                          node,
                          index,
                          index === template.availableTemplateActions.length - 1
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{node.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            )}
          </div>

          <Button
            className="bg-[#FF7801] text-white font-medium hover:bg-[#FF7801]/90 shadow-sm"
            asChild
          >
            <Link href={`/templates/${template.id}`}>Use This Template</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
