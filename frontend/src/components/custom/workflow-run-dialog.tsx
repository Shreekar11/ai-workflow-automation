import { Workflow } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";

interface WorkflowRunDialogProps {
  selectedWorkflow: Workflow | null;
  setSelectedWorkflow: React.Dispatch<React.SetStateAction<Workflow | null>>;
}

const WorkflowRunDialog = ({
  selectedWorkflow,
  setSelectedWorkflow,
}: WorkflowRunDialogProps) => {
  function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return (
    <Dialog
      open={selectedWorkflow !== null}
      onOpenChange={() => setSelectedWorkflow(null)}
    >
      <DialogContent className="max-h-[85vh] max-w-[50%] w-full overflow-hidden">
        <DialogHeader>
          <DialogTitle>{selectedWorkflow?.workflow?.name} Metadata</DialogTitle>
          <DialogDescription>
            Workflow details and run history
          </DialogDescription>
        </DialogHeader>
        <div
          className="mt-4 space-y-4 overflow-y-auto pr-2"
          style={{ maxHeight: "calc(85vh - 180px)" }}
        >
          <div>
            <h3 className="font-semibold mb-2">Recent Run Metadata</h3>
            <div className="">
              {selectedWorkflow &&
              selectedWorkflow?.workflow?.workflowRuns.length > 0 ? (
                <div className="space-y-4">
                  {selectedWorkflow?.workflow?.workflowRuns.map(
                    (workflowRun, index) => (
                      <div key={index} className="bg-muted p-4 rounded-md ">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Status:</span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              workflowRun.status.toLowerCase() === "completed"
                                ? "bg-green-100 text-green-800"
                                : workflowRun.status.toLowerCase() === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {workflowRun.status.toLowerCase() ===
                              "completed" && (
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                            )}
                            {workflowRun.status.toLowerCase() === "failed" && (
                              <XCircle className="w-4 h-4 mr-1" />
                            )}
                            {capitalizeFirstLetter(
                              selectedWorkflow?.workflow?.workflowRuns[0]
                                ?.status
                            )}
                          </span>
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap break-all">
                          {JSON.stringify(workflowRun?.metadata, null, 2)}
                        </pre>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No workflow runs available
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowRunDialog;
