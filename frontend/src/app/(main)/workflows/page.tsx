"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { useWorkflows } from "@/lib/hooks/useWorkflows";

// components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WorkflowTable } from "@/components/custom/workflow-table";
import { useUser } from "@clerk/nextjs";

const WorkflowPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const { isLoading, workflows, setWorkflows } = useWorkflows();

  const handleViewWorkflow = (id: string) => {
    router.push(`/workflows/${id}`);
  };

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(
      (workflow) =>
        workflow.workflow.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.workflow.trigger.type.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        workflow.workflow.actions.some((action) =>
          action.type.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }, [workflows, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900">
      <main className="container px-4 sm:pr-10 sm:px-6 lg:px-8 lg:pr-12 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back! {user?.firstName && user.firstName}
            </h1>
            <p className="text-gray-600">
              Manage and monitor your automated workflows
            </p>
          </div>
          {workflows.length !== 0 && (
            <Button
              className="bg-[#FF7801] text-white hover:bg-[#FF7801]/90"
              onClick={() => router.push("/workflows/create")}
            >
              <Plus className="mr-2 h-4 w-4" /> New Workflow
            </Button>
          )}
        </div>
        <div className="mb-6 relative">
          <Input
            type="text"
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <WorkflowTable
            workflows={filteredWorkflows}
            setWorkflows={setWorkflows}
            onViewWorkflow={handleViewWorkflow}
            loading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default WorkflowPage;
