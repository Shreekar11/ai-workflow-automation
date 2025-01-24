"use client";

import { useWorkflow } from "@/lib/hooks/useWorkflow";
import { useParams } from "next/navigation";
import WorkflowBuilder from "@/components/custom/workflow-builder";

const WorkflowPlayPage = () => {
  const params = useParams();
  const id = params.id;

  const { loading, workflow } = useWorkflow(id);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="relative w-12 h-12" role="status" aria-label="Loading">
          <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-[#FFE0C2] rounded-full"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-[#FF7801] rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full h-screen flex flex-col">
      <div className="flex-grow">
        <WorkflowBuilder workflow={workflow || null} />
      </div>
    </main>
  );
};

export default WorkflowPlayPage;
