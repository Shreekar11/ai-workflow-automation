"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useCallback, SetStateAction, useEffect } from "react";

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

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import ActionNode from "./action-node";
import TriggerNode from "./trigger-node";
import SelectDialog from "./select-dialog";
import AddActionButton from "./add-action-button";

import { publishWorkflow, updateWorkflow } from "@/lib/actions/workflow.action";
import { useToast } from "@/lib/hooks/useToast";
import { Workflow } from "@/types";

interface WorkflowBuilderProps {
  loading?: boolean;
  workflow?: Workflow | null;
  setWorkflow?: React.Dispatch<SetStateAction<Workflow | null>>;
}

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

const createInitialNodes = (workflow?: Workflow | null): Node[] => {
  if (!workflow) {
    return [
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
  }

  const nodes: Node[] = [
    {
      id: "trigger",
      type: "trigger",
      position: { x: 600, y: 100 },
      data: {
        label: "Trigger",
        selectedOption: workflow.trigger.type.name,
      },
    },
  ];

  workflow.actions.forEach((action, index) => {
    nodes.push({
      id: `action${index + 1}`,
      type: "action",
      position: { x: 600, y: 350 + index * 150 },
      data: {
        label: `Action ${index + 1}`,
        selectedOption: action.type.name,
      },
    });
  });

  return nodes;
};

const createInitialEdges = (workflow?: Workflow | null): Edge[] => {
  if (!workflow) {
    return [
      {
        id: "e-trigger-action1",
        source: "trigger",
        target: "action1",
        animated: true,
      },
    ];
  }

  const edges: Edge[] = [];
  let previousNodeId = "trigger";

  workflow.actions.forEach((_, index) => {
    const currentNodeId = `action${index + 1}`;
    edges.push({
      id: `e-${previousNodeId}-${currentNodeId}`,
      source: previousNodeId,
      target: currentNodeId,
      animated: true,
    });
    previousNodeId = currentNodeId;
  });

  return edges;
};

export default function WorkflowBuilder({
  loading,
  workflow,
  setWorkflow,
}: WorkflowBuilderProps) {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    createInitialNodes(workflow)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    createInitialEdges(workflow)
  );
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState(
    workflow?.name || "Untitled Workflow"
  );

  const [selectTrigger, setSelectTrigger] = useState<{
    id: string;
    name: string;
  }>({
    id: workflow?.triggerId || "",
    name: workflow?.trigger?.type?.name || "",
  });

  const [actionData, setActionData] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [selectActions, setSelectActions] = useState<
    {
      id: string;
      name: string;
    }[]
  >(actionData || []);

  useEffect(() => {
    if (workflow) {
      setNodes(createInitialNodes(workflow));
      setEdges(createInitialEdges(workflow));
      setWorkflowName(workflow.name);
      const trigger_data = {
        id: workflow.trigger.type.id,
        name: workflow.trigger.type.name,
      };
      setSelectTrigger(trigger_data);
      const action_data = workflow.actions.map((ax) => {
        return {
          id: ax.type.id,
          name: ax.type.name,
        };
      });
      setActionData(action_data);
      setSelectActions(action_data);
    }
  }, [workflow, setNodes, setEdges]);

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
      if (!selectedNode) {
        handleCloseDialog();
        return;
      }

      const nodeNumber = selectedNode
        ? parseInt(selectedNode.id.substring(6, 7))
        : 0;

      if (option.type === "action") {
        const newAction = { id: option.id, name: option.name };

        if (workflow && selectActions.length >= nodeNumber) {
          const isExistingAction =
            selectActions[nodeNumber - 1].name === option.name;

          if (isExistingAction) {
            setSelectActions((prevActions) => [
              ...prevActions.filter((action) => action.id !== option.id),
              newAction,
            ]);
          } else {
            setSelectActions((prevActions) =>
              prevActions.map((action, index) =>
                index === nodeNumber - 1 ? newAction : action
              )
            );
          }
        } else {
          setSelectActions((prevActions) => [
            ...prevActions.filter((action) => action.id !== option.id),
            newAction,
          ]);
        }
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

      handleCloseDialog();
    },
    [selectedNode, setNodes, handleCloseDialog, workflow, selectActions]
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

    setIsLoading(true);
    try {
      let response;

      response = workflow
        ? await updateWorkflow(
            workflow.id,
            selectActions,
            selectTrigger,
            workflowName,
            user?.id || ""
          )
        : await publishWorkflow(
            selectActions,
            selectTrigger,
            workflowName,
            user?.id || ""
          );

      if (!response.status) {
        throw new Error(
          response.message || workflow
            ? "Error updating workflow"
            : "Error creating workflow"
        );
      }

      toast({
        variant: "success",
        title: "Success!",
        description: workflow
          ? "Workflow updated successfully!"
          : "Workflow published successfully!",
      });

      setTimeout(() => {
        router.push("/workflows");
      }, 1000);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          err.message || workflow
            ? "Error updating workflow"
            : "Error creating workflow",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="w-full py-2 px-6 bg-[#f2f2f2]">
        <div className="border rounded-xl p-2 bg-white/50 backdrop-blur-lg w-full max-w-screen-lg mx-auto flex items-center justify-between">
          <Input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-lg w-[50%] bg-white"
            placeholder="Workflow Name"
          />
          <div className="flex justify-center items-center gap-3">
            <AddActionButton onClick={handleAddAction} />
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={handlePublishWorkflow}
              className="bg-[#FF7801] text-white rounded-lg hover:bg-[#FF7801]/80 hover:text-white"
            >
              {isLoading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {workflow ? "Update" : "Publish"}
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
