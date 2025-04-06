"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain,
  Calendar,
  Database,
  File,
  FileText,
  Filter,
  Folder,
  FolderTree,
  Globe,
  Image,
  Layout,
  LinkIcon,
  Mail,
  Scissors,
  Search,
  Share,
  Type,
  User,
  UserSearch,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import WorkflowNode from "./workflow-node";

const iconMap = {
  brain: Brain,
  calendar: Calendar,
  database: Database,
  file: File,
  "file-text": FileText,
  filter: Filter,
  folder: Folder,
  "folder-tree": FolderTree,
  globe: Globe,
  image: Image,
  layout: Layout,
  link: LinkIcon,
  mail: Mail,
  scissors: Scissors,
  search: Search,
  share: Share,
  type: Type,
  user: User,
  "user-search": UserSearch,
  users: Users,
};

export default function TemplateCard({ template }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{template.name}</CardTitle>
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative py-4">
          <div className="absolute top-[40%] left-0 right-0 h-0.5 bg-muted-foreground/20" />
          <div className="relative flex justify-between">
            {template.availableTemplateActions.map(
              (node: any, index: number) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="z-10">
                        <WorkflowNode
                          node={node}
                          index={index}
                          isLast={
                            index ===
                            template.availableTemplateActions.length - 1
                          }
                          iconMap={iconMap}
                        />
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
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          className="w-full bg-[#FF7801] text-white hover:bg-[#FF7801]/90"
          asChild
        >
          <Link href={`/templates/${template.id}`}>View This Template</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
