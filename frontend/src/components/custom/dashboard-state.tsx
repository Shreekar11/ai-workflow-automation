"use client";
import { Workflow } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/hooks/useToast";
import { Eye, Plus, Layout, Trash, ChevronRight } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardPageProps {
  loading: boolean;
  workflows: Workflow[];
  handleCreateWorkflow: () => void;
  onViewWorkflow: (value: string) => void;
  setSelectedWorkflow: any;
  setWorkflowId: any;
  setOpenDialog: any;
  formatDate: (date: string) => string;
}

export default function DashboardPage({
  loading,
  workflows,
  handleCreateWorkflow,
  onViewWorkflow,
  setSelectedWorkflow,
  setWorkflowId,
  setOpenDialog,
  formatDate,
}: DashboardPageProps) {
  const router = useRouter();
  const { toast } = useToast();

  //   const tutorials = [
  //     {
  //       id: 1,
  //       icon: <Layout size={20} />,
  //       category: "Web Scraping",
  //       title: "Scrape and extract from websites",
  //       color: "purple-50",
  //       onClick: () => router.push("/templates/web-scraping"),
  //     },
  //     {
  //       id: 2,
  //       icon: <FileText size={20} className="text-blue-500" />,
  //       category: "Document Processing",
  //       title: "Process a PDF with AI",
  //       color: "blue-50",
  //       onClick: () => router.push("/templates/document-processing"),
  //     },
  //   ];

  // If there are workflows or it's loading, render the regular table
  if (loading || (workflows && workflows.length > 0)) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Trigger</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Webhook</TableHead>
            <TableHead>Webhook Secret</TableHead>
            <TableHead>Workflow Runs</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">View</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-6 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-36" />
                  </TableCell>{" "}
                  <TableCell>
                    <Skeleton className="h-6 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-16 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            : workflows.map((wf) => (
                <TableRow key={wf.workflow.id}>
                  <TableCell className="font-medium">
                    {wf.workflow.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      {wf.workflow.trigger.type.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {wf.workflow.actions.map((action, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          {action.type.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {`${process.env.NEXT_PUBLIC_WEBHOOK_URL}/hooks/${wf.workflow.id}`}
                  </TableCell>
                  <TableCell className="text-sm">
                    {wf.workflow.trigger.type.name === "Webhook" &&
                    wf.webhookKey?.secretKey ? (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            wf.webhookKey.secretKey
                          );
                          toast({
                            variant: "success",
                            description: "Secret key copied to clipboard!",
                          });
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Copy Secret
                      </button>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>

                  <TableCell
                    className="cursor-pointer"
                    onClick={() => setSelectedWorkflow(wf)}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between"
                    >
                      <span>{wf.workflow.workflowRuns.length}</span>
                      <span className="sr-only">View workflow runs</span>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </Button>
                  </TableCell>
                  <TableCell>{formatDate(wf.workflow.timestamp)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewWorkflow(wf.workflow.id)}
                      className="hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setWorkflowId(wf.workflow.id);
                        setOpenDialog(true);
                      }}
                      className="hover:bg-red-100"
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="w-full py-8 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-xl font-bold mb-1">Get Started</h1>
        <p className="text-md text-gray-600 mb-8">
          Create your first workflow to get started, or check out pre-built
          templates
        </p>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="text-sm bg-white border-gray-200 hover:bg-gray-50 px-2 py-1"
            onClick={() => router.push("/templates")}
          >
            <Layout size={10} />
            Start With a Template
          </Button>

          <Button
            className="bg-[#FF7801] hover:bg-[#FF7801]/90 text-white px-6 py-1 text-sm"
            onClick={handleCreateWorkflow}
          >
            <Plus size={10} />
            Create Workflow
          </Button>
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              className={` bg-gradient-to-tr from-[#ffebd9] to-white rounded-xl p-6 text-left cursor-pointer hover:shadow-md transition-shadow border hover:border-gray-200`}
              onClick={tutorial.onClick}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="mb-4">{tutorial.icon}</div>
                  <h3 className="text-base font-medium text-[#FF7801] mb-1">
                    {tutorial.category}
                  </h3>
                  <p className="text-lg font-semibold text-gray-900 mb-0">
                    {tutorial.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}
