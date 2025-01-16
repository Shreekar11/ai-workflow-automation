"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWorkflows } from "@/lib/hooks/useWorkflows";

// components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { WorkflowTable } from "@/components/custom/workflow-table";
import { useUser } from "@clerk/nextjs";

const WorkflowPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { loading, workflows, setWorkflows } = useWorkflows();
  const [searchTerm, setSearchTerm] = useState("");

  const handleViewWorkflow = (id: string) => {
    router.push(`/workflows/${id}`);
  };

  const filteredWorkflows = workflows.filter(
    (workflow) =>
      workflow.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.trigger.type.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      workflow.actions.some((action) =>
        action.type.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900">
      <Navbar />
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
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
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
};

export default WorkflowPage;
