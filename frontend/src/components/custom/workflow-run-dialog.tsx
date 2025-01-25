import { Workflow } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface WorkflowRunDialogProps {
  selectedWorkflow: Workflow | null;
  setSelectedWorkflow: React.Dispatch<React.SetStateAction<Workflow | null>>;
}

const WorkflowRunDialog = ({
  selectedWorkflow,
  setSelectedWorkflow,
}: WorkflowRunDialogProps) => {
  return (
    <Dialog
      open={selectedWorkflow !== null}
      onOpenChange={() => setSelectedWorkflow(null)}
    >
      <DialogContent className="max-h-[85vh] max-w-[50%] w-full overflow-hidden">
        <DialogHeader>
          <DialogTitle>{selectedWorkflow?.name} Metadata</DialogTitle>
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
              {selectedWorkflow && selectedWorkflow?.workflowRuns.length > 0 ? (
                <div className="space-y-4">
                  {selectedWorkflow?.workflowRuns.map((workflowRun, index) => (
                    <pre
                      key={index}
                      className="bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-all"
                    >
                      {JSON.stringify(workflowRun?.metadata, null, 2)}
                    </pre>
                  ))}
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
