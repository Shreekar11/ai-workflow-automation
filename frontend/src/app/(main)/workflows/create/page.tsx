import WorkflowBuilder from "@/components/custom/workflow-builder";

const CreateWorkflowPage = () => {
  return (
    <main className="w-full h-screen flex flex-col">
      <div className="flex-grow">
        <WorkflowBuilder />
      </div>
    </main>
  );
};

export default CreateWorkflowPage;
