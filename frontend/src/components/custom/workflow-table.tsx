import { useState } from "react";
import { Workflow } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// icons
import { ChevronRight, Eye, Plus, Trash } from "lucide-react";

// components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "./delete-dialog";
import { Button } from "@/components/ui/button";
import WorkflowRunDialog from "./workflow-run-dialog";
import { toast, useToast } from "@/lib/hooks/useToast";

interface WorkflowTableProps {
  workflows: Workflow[];
  setWorkflows: React.Dispatch<React.SetStateAction<Workflow[]>>;
  onViewWorkflow: (id: string) => void;
  loading: Boolean;
}

export const WorkflowTable: React.FC<WorkflowTableProps> = ({
  workflows,
  setWorkflows,
  onViewWorkflow,
  loading,
}) => {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [workflowId, setWorkflowId] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(
    null
  );
  const handleCreateWorkflow = () => {
    router.push("/workflows/create");
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="rounded-md border">
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
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
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
          ) : workflows.length > 0 ? (
            workflows.map((wf) => (
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
                        navigator.clipboard.writeText(wf.webhookKey.secretKey);
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 py-10 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="text-gray-500">
                    No workflows yet. Create your first workflow to get started!
                  </div>
                  <Button
                    className="bg-[#FF7801] text-white hover:bg-[#FF7801]/90"
                    onClick={handleCreateWorkflow}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create Your First Workflow
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <WorkflowRunDialog
        selectedWorkflow={selectedWorkflow}
        setSelectedWorkflow={setSelectedWorkflow}
      />

      <DeleteDialog
        user={user}
        workflows={workflows}
        workflowId={workflowId}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        setWorkflows={setWorkflows}
        title="Delete Workflow"
        description="Are you sure you want to delete this workflow? All associated data will be permanently removed."
      />
    </div>
  );
};
