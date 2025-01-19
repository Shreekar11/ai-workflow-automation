"use client";

import { Workflow } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/hooks/useToast";
import { useState, useCallback, useEffect } from "react";
import { createInitialEdges, createInitialNodes } from "@/utils/flow-handler";
import { publishWorkflow, updateWorkflow } from "@/lib/actions/workflow.action";

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
import { ArrowLeft, FileSpreadsheet, Mail, Webhook } from "lucide-react";
import { PulsatingButton } from "../ui/pulsating-button";

import NodeCard from "./node-card";
import ActionNode from "./action-node";
import TriggerNode from "./trigger-node";
import AddActionButton from "./add-action-button";
import { api } from "@/app/api/client";

interface WorkflowBuilderProps {
  workflow?: Workflow | null;
}

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

export default function WorkflowBuilder({ workflow }: WorkflowBuilderProps) {
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
    metadata: any;
  }>({
    id: workflow?.triggerId || "",
    name: workflow?.trigger?.type?.name || "",
    metadata: {},
  });

  const [actionData, setActionData] = useState<
    {
      id: string;
      name: string;
      metadata: {};
      triggerMetadata: {},
    }[]
  >([]);
  const [selectActions, setSelectActions] = useState<
    {
      id: string;
      name: string;
      metadata: {};
      triggerMetadata?: {};
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
        metadata: workflow.trigger.metadata,
      };
      setSelectTrigger(trigger_data);
      const action_data = workflow.actions.map((ax) => {
        return {
          id: ax.type.id,
          name: ax.type.name,
          metadata: ax.metadata,
          triggerMetadata: workflow.trigger.metadata,
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
        y: lastActionNode.position.y + 250,
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

  const handleCloseSheet = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleSelectOption = useCallback(
    (option: { id: string; type: string; name: string; metadata: any }) => {
      if (!selectedNode) {
        handleCloseSheet();
        return;
      }

      const nodeNumber = selectedNode
        ? parseInt(selectedNode.id.substring(6, 7))
        : 0;

      if (option.type === "action") {
        const newAction = {
          id: option.id,
          name: option.name,
          metadata: option.metadata,
        };

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
          setSelectActions((prevActions) => [...prevActions, newAction]);
        }
      } else {
        setSelectTrigger({
          id: option.id,
          name: option.name,
          metadata: option.metadata,
        });
      }

      setNodes((items) =>
        items.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  selectedOption: {
                    icon:
                      option.name === "Webhook" ? (
                        <Webhook />
                      ) : option.name === "Email" ? (
                        <Mail />
                      ) : (
                        <FileSpreadsheet />
                      ),
                    name: option.name,
                    metadata: option.metadata,
                    triggerMetadata:
                      selectTrigger.metadata || workflow?.trigger.metadata,
                  },
                },
              }
            : node
        )
      );

      handleCloseSheet();
    },
    [selectedNode, setNodes, workflow, selectActions]
  );

  const handlePublishWorkflow = async () => {
    const { id, name, metadata } = selectTrigger;

    // filtering out empty metadata values
    const filteredActions = selectActions.map((action) => ({
      ...action,
      metadata: Object.fromEntries(
        Object.entries(action.metadata).filter(([_, value]) => value !== "")
      ),
    }));

    if (!id || !name || !metadata) {
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
            filteredActions,
            selectTrigger,
            workflowName,
            user?.id || ""
          )
        : await publishWorkflow(
            filteredActions,
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
        router.push(`/workflows/${response.data?.id}`);
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

  const handleRunWorkflow = async () => {
    const actionMetadata = selectActions.reduce((acc, action) => {
      return {
        ...acc,
        ...(action.metadata || {}),
      };
    }, {});

    try {
      const response = await api.post(
        `${process.env.NEXT_PUBLIC_WEBHOOK_URL}/hooks/${workflow?.id}`,
        {
          actionMetadata,
        },
        {
          headers: {
            "clerk-user-id": user?.id,
          },
        }
      );

      const data = response.data;
      if (!data.status) {
        throw new Error("Error running the workflow");
      }

      toast({
        variant: "success",
        title: "Success!",
        description: "Workflow run successful",
      });
    } catch (err) {
      console.log("Error: ", err);

      toast({
        variant: "destructive",
        title: "Uh! Something went wrong",
        description: "Error running the workflow",
      });
    }
  };
  return (
    <div className="flex flex-col w-full h-screen relative">
      <div className="w-full py-2 px-6 bg-[#f2f2f2]">
        <div
          className="border rounded-xl p-2 bg-white/50 backdrop-blur-lg 
        w-full max-w-screen-lg mx-auto flex items-center justify-between"
        >
          <div className="flex items-center gap-4 w-[50%]">
            <Button
              variant="ghost"
              onClick={() => router.push("/workflows")}
              className="p-2 hover:bg-gray-100 "
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-lg bg-white"
              placeholder="Workflow Name"
            />
          </div>
          <div className="flex justify-center items-center gap-3">
            <AddActionButton onClick={handleAddAction} />
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={handlePublishWorkflow}
              className="bg-[#FF7801] text-white  
              hover:bg-[#FF7801]/80 hover:text-white"
            >
              {isLoading && (
                <div
                  className="h-4 w-4 animate-spin rounded-full 
                border-2 border-current border-t-transparent"
                />
              )}
              {workflow ? "Update" : "Publish"}
            </Button>

            {workflow && (
              <PulsatingButton onClick={handleRunWorkflow}>
                Run flow
              </PulsatingButton>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full relative">
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
          {!!selectedNode && (
            <div className="absolute top-10 right-32 h-full w-96 z-10">
              <NodeCard
                workflow={workflow || null}
                selectTrigger={selectTrigger}
                isOpen={!!selectedNode}
                onClose={handleCloseSheet}
                onSelect={handleSelectOption}
                type={selectedNode?.type as "trigger" | "action"}
              />
            </div>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}
