"use client";

import { useWorkflow } from "@/lib/hooks/useWorkflow";
import { useParams } from "next/navigation";
import WorkflowBuilder from "@/components/custom/workflow-builder";

const WorkflowPlayPage = () => {
  const params = useParams();
  const id = params.id;

  const { loading, workflow, setWorkflow } = useWorkflow(id);

  return (
    <main className="w-full h-screen flex flex-col">
      <div className="flex-grow">
        <WorkflowBuilder
          loading={loading}
          workflow={workflow}
          setWorkflow={setWorkflow}
        />
      </div>
    </main>
  );
};

export default WorkflowPlayPage;
