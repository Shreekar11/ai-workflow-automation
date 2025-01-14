"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

// react-flow components
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";

// custom react-flow components
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import ActionNode from "./action-node";
import TriggerNode from "./trigger-node";
import SelectDialog from "./select-dialog";
import AddActionButton from "./add-action-button";

// action
import { publishWorkflow } from "@/lib/actions/workflow.action";
import { useToast } from "@/lib/hooks/useToast";

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

const initialNodes: Node[] = [
  {
    id: "trigger",
    type: "trigger",
    position: { x: 600, y: 100 },
    data: { label: "Trigger" },
  },
  {
    id: "action1",
    type: "action",
    position: { x: 600, y: 350 },
    data: { label: "Action 1" },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e-trigger-action1",
    source: "trigger",
    target: "action1",
    animated: true,
  },
];

export default function WorkflowBuilder() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");

  const [selectTrigger, setSelectTrigger] = useState<{
    id: string;
    name: string;
  }>({
    id: "",
    name: "",
  });

  const [selectActions, setSelectActions] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((items) => addEdge(params, items)),
    [setEdges]
  );

  const handleAddAction = useCallback(() => {
    const newActionId = `action${nodes.length}`;
    const lastActionNode = nodes[nodes.length - 1];

    const newActionNode: Node = {
      id: newActionId,
      type: "action",
      position: {
        x: lastActionNode.position.x,
        y: lastActionNode.position.y + 150,
      },
      data: { label: `Action ${nodes.length}` },
    };

    setNodes((items) => [...items, newActionNode]);
    setEdges((items) => [
      ...items,
      {
        id: `e-${lastActionNode.id}-${newActionId}`,
        source: lastActionNode.id,
        target: newActionId,
        animated: true,
      },
    ]);
  }, [nodes, setNodes, setEdges]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleSelectOption = useCallback(
    (option: { id: string; type: string; name: string }) => {
      if (selectedNode) {
        if (option.type === "action") {
          setSelectActions((prevActions) => [
            ...prevActions.filter((action) => action.id !== option.id),
            { id: option.id, name: option.name },
          ]);
        } else {
          setSelectTrigger({
            id: option.id,
            name: option.name,
          });
        }

        setNodes((items) =>
          items.map((node) =>
            node.id === selectedNode.id
              ? { ...node, data: { ...node.data, selectedOption: option.name } }
              : node
          )
        );
      }
      handleCloseDialog();
    },
    [selectedNode, setNodes, handleCloseDialog]
  );

  const handlePublishWorkflow = async () => {
    const { id, name } = selectTrigger;
    if (!id || !name) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Trigger not selected. Please select a trigger!",
      });

      return;
    }
    if (!(selectActions.length > 0)) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Actions not selected. Please select an action!",
      });

      return;
    }
    try {
      const response = await publishWorkflow(
        selectActions,
        selectTrigger,
        workflowName,
        user?.id || ""
      );
      if (!response.status) {
        throw new Error(response.message || "Error creating workflow");
      }
      toast({
        variant: "success",
        title: "Success!",
        description: "Workflow published successfully!",
      });
      setTimeout(() => {
        router.push("/workflows");
      }, 1000);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: err.message || "Error creating a workflow",
      });
    }
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="w-full py-2 px-6 bg-[#f2f2f2]">
        <div
          className="border rounded-xl p-2 bg-white/50 backdrop-blur-lg 
        w-full max-w-screen-lg mx-auto flex items-center justify-between"
        >
          <Input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-lg w-[50%] bg-white"
            placeholder="Workflow Name"
          />
          <div className="flex justify-center items-center gap-4">
            <AddActionButton onClick={handleAddAction} />
            <Button
              variant="outline"
              onClick={handlePublishWorkflow}
              className="bg-[#FF7801] text-white hover:bg-[#FF7801]/80 hover:text-white"
            >
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
        >
          <Controls />
          <Background variant={"dots" as BackgroundVariant} gap={12} size={1} />
        </ReactFlow>
      </div>

      {selectedNode && (
        <SelectDialog
          isOpen={!!selectedNode}
          onClose={handleCloseDialog}
          onSelect={handleSelectOption}
          type={selectedNode.type as "trigger" | "action"}
        />
      )}
    </div>
  );
}
