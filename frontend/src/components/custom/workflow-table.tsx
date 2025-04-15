import { useState } from "react";
import { Workflow } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import DeleteDialog from "./delete-dialog";
import DashboardPage from "./dashboard-state";
import WorkflowRunDialog from "./workflow-run-dialog";

interface WorkflowTableProps {
  workflows: Workflow[];
  setWorkflows: React.Dispatch<React.SetStateAction<Workflow[]>>;
  onViewWorkflow: (id: string) => void;
  loading: boolean;
}

export const WorkflowTable: React.FC<WorkflowTableProps> = ({
  workflows,
  setWorkflows,
  onViewWorkflow,
  loading,
}) => {
  const router = useRouter();
  const { user } = useUser();
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
      {/* <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Workflows</h1>
        {workflows.length > 0 && (
          <Button
            onClick={handleCreateWorkflow}
            className="bg-[#FF7801] text-white hover:bg-[#FF7801]/90"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Workflow
          </Button>
        )}
      </div> */}

      <DashboardPage
        loading={loading}
        workflows={workflows}
        handleCreateWorkflow={handleCreateWorkflow}
        onViewWorkflow={onViewWorkflow}
        setSelectedWorkflow={setSelectedWorkflow}
        setWorkflowId={setWorkflowId}
        setOpenDialog={setOpenDialog}
        formatDate={formatDate}
      />

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
