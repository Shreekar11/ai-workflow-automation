"use client";

import { useCallback, useState } from "react";
import { useRuns } from "@/lib/hooks/useRuns";
import { Search, Activity, Layout } from "lucide-react";
import { TemplateTable } from "@/components/runs/template-table";
import { WorkflowTable } from "@/components/runs/workflow-table";
import { MetadataViewer } from "@/components/runs/metadata-viewer";

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RunSkeleton from "@/components/runs/runs-skeleton";

export default function DashboardPage() {
  const { isLoading, runs } = useRuns();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredWorkflows = runs.workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTemplates = runs.templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = useCallback(
    (item: any) => {
      setSelectedItem(item);
      setDialogOpen(true);
    },
    [selectedItem, dialogOpen]
  );

  if (isLoading) {
    return <RunSkeleton />;
  }

  return (
    <div className="w-full p-4">
      <div className="grid gap-4">
        <div>
          <div className="pb-3">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="pb-2 text-3xl font-bold tracking-tight">
                  Run History
                </div>
                <div>View all your workflow and template execution history</div>
              </div>
              <div className="w-full md:w-64">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by name..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <Tabs defaultValue="templates" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="templates" className="flex items-center">
                  <Layout className="mr-2 h-4 w-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="workflows" className="flex items-center">
                  <Activity className="mr-2 h-4 w-4" />
                  Workflows
                </TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-4">
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">
                    Recent Template Results
                  </h3>
                  {filteredTemplates.flatMap(
                    (template) => template.templateResults
                  ).length === 0 ? (
                    <div className="text-center py-10 border rounded-md">
                      <p className="text-muted-foreground">
                        No template runs found
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <TemplateTable
                        filteredTemplates={filteredTemplates}
                        onViewDetails={handleViewDetails}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="workflows" className="space-y-4">
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">
                    Recent Workflow Runs
                  </h3>
                  {filteredWorkflows.flatMap(
                    (workflow) => workflow.workflowRuns
                  ).length === 0 ? (
                    <div className="text-center py-10 border rounded-md">
                      <p className="text-muted-foreground">
                        No workflow runs found
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <WorkflowTable
                        filteredWorkflows={filteredWorkflows}
                        onViewDetails={handleViewDetails}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.workflowName
                ? `Workflow Run Details: ${selectedItem.workflowName}`
                : selectedItem?.templateName
                ? `Template Result Details: ${selectedItem.templateName}`
                : "Run Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.id ? (
                <span className="font-mono text-xs">ID: {selectedItem.id}</span>
              ) : (
                "Detailed information about this run"
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {selectedItem && <MetadataViewer item={selectedItem} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
