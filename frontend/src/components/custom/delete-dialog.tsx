// components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// icon
import { AlertTriangle } from "lucide-react";
import React, { useState } from "react";
import { toast } from "@/lib/hooks/useToast";
import { Workflow } from "@/types";
import { deleteWorkflow } from "@/lib/actions/workflow.action";
import { useToken } from "@/lib/hooks/useToken";

interface DeleteDialogProps {
  user: any;
  workflowId: string;
  openDialog: boolean;
  workflows: Workflow[];
  setWorkflows: React.Dispatch<React.SetStateAction<Workflow[]>>;
  setOpenDialog: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function DeleteDialog({
  user,
  workflowId,
  workflows,
  openDialog,
  setOpenDialog,
  setWorkflows,
  title = "Delete Confirmation",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
}: DeleteDialogProps) {
  const { token, sessionId } = useToken();
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteWorkflow(
        workflowId,
        user?.id || "",
        token,
        sessionId || ""
      );
      if (!response.status) {
        throw new Error(response.message || "Error deleting workflow");
      }
      const currentWorkflows = workflows.filter(
        (item) => item.id !== workflowId
      );
      setWorkflows(currentWorkflows);
      setOpenDialog(false);
      toast({
        variant: "success",
        title: "Success!",
        description: "Workflow deleted successfully",
      });
    } catch (err: any) {
      console.error("Error deleting workflow: ", err.message);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: err.message || "Error deleting workflow",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpenDialog(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
