"use client"

import { useState } from "react"
import Link from "next/link"
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
  ImageIcon,
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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import WorkflowNode from "./workflow-node"
import type { PreTemplateType } from "@/types"

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
  image: ImageIcon,
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
}

export default function TemplateCard({
  template,
}: {
  template: PreTemplateType
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="overflow-hidden transition-all duration-300 border-border/60 hover:border-[#FF7801]/50 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold">{template.name}</CardTitle>
            <CardDescription className="mt-1.5 line-clamp-2">{template.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {template.availableTemplateActions.map((node: any, index: number) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <WorkflowNode
                        node={node}
                        index={index}
                        isLast={index === template.availableTemplateActions.length - 1}
                        iconMap={iconMap}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{node.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          <Button className="bg-[#FF7801] text-white font-medium hover:bg-[#FF7801]/90 shadow-sm" asChild>
            <Link href={`/templates/${template.id}`}>Use This Template</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
