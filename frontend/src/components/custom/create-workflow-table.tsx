import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

const CreateWorkflowTable = ({
  handleCreateWorkflow,
}: {
  handleCreateWorkflow: () => void;
}) => {
  return (
    <Table className="border md:rounded-lg rounded-lg">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Trigger</TableHead>
          <TableHead>Actions</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="text-right">View</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} className="text-center">
            <div className="text-gray-500 my-4">
              No workflows yet. Create your first workflow to get started!
            </div>
            <Button
              className="bg-[#FF7801] text-white hover:bg-[#FF7801]/90"
              onClick={handleCreateWorkflow}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Your First Workflow
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default CreateWorkflowTable;
