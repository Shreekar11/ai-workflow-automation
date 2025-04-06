"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TemplateCard from "@/components/template/template-card";
import { useTemplates } from "@/lib/hooks/useTemplates";
import TemplateSkeleton from "@/components/template/template-skeleton";

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { isLoading, error, templates } = useTemplates();

  // const templates = [
  //   {
  //     id: "blog-scraper",
  //     title: "Blog Scraper to Google Docs",
  //     description:
  //       "Scrape content from any blog URL, summarize it with AI, and save it to Google Docs automatically.",
  //     nodes: [
  //       { type: "input", name: "URL Input", icon: "link" },
  //       { type: "ai", name: "LLM Model", icon: "brain" },
  //       { type: "output", name: "Google Docs", icon: "file-text" },
  //     ],
  //   },
  //   {
  //     id: "company-scraper",
  //     title: "Linkedin Company Page Scraper",
  //     description:
  //       "Get any company details using this template. Just add the company Linkedin page url and get the info automatically",
  //     nodes: [
  //       { type: "input", name: "Linkedin company url", icon: "link" },
  //       { type: "ai", name: "Content Generator", icon: "brain" },
  //       { type: "output", name: "Google Docs", icon: "file-text" },
  //     ],
  //   },
  // ];

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <TemplateSkeleton />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Workflow Templates</h1>
        <p className="text-muted-foreground">
          Pre-built workflows to help you automate your tasks quickly. Select a
          template to get started.
        </p>
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="w-full text-center py-12">
          <h3 className="text-lg font-medium">No templates found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search query
          </p>
        </div>
      )}

      <div className="mt-12 bg-muted rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Need a custom workflow?</h2>
        <p className="text-muted-foreground mb-4">
          Can&apos;t find what you&apos;re looking for? Create a custom workflow
          from scratch or request a template.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button
            asChild
            className="bg-[#FF7801] text-white hover:bg-[#FF7801]/90"
          >
            <Link href="/workflows/create">Create Custom Workflow</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/request-template">Request Template</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
