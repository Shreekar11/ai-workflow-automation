"use client";

import { api } from "@/app/api/client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useToken } from "@/lib/hooks/useToken";
import { useToast } from "@/lib/hooks/useToast";
import { useState, useCallback, useEffect } from "react";
import { ActionType, TriggerType, Workflow } from "@/types";
import { createInitialEdges, createInitialNodes } from "@/utils/flow-handler";
import { publishWorkflow, updateWorkflow } from "@/lib/actions/workflow.action";

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

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { PulsatingButton } from "../ui/pulsating-button";

import ActionNode from "./action-node";
import TriggerNode from "./trigger-node";
import AddActionButton from "./add-action-button";

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
  const { token, sessionId } = useToken();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [workflowName, setWorkflowName] = useState(
    workflow?.workflow?.name || "Untitled Workflow"
  );

  // State for trigger and actions
  const [finalTrigger, setFinalTrigger] = useState<TriggerType>({
    id: workflow?.workflow?.triggerId || "",
    name: workflow?.workflow?.trigger?.type?.name || "",
    metadata: workflow?.workflow?.trigger?.metadata || {},
  });

  const [selectActions, setSelectActions] = useState<ActionType[]>(
    workflow?.workflow?.actions.map((ax) => ({
      id: ax.type.id,
      name: ax.type.name,
      metadata: ax.metadata,
    })) || []
  );

  // Initialize nodes and edges with the state-updating callbacks
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Initialize nodes and edges when component loads or workflow changes
  useEffect(() => {
    setNodes(
      createInitialNodes(
        workflow,
        setFinalTrigger,
        selectActions,
        setSelectActions
      )
    );
    setEdges(createInitialEdges(workflow));
  }, [workflow, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((items) => addEdge(params, items)),
    [setEdges]
  );

  const handleAddAction = useCallback(() => {
    const newActionId = `action${nodes.length}`;
    const lastActionNode = nodes[nodes.length - 1];

    // Create new action node with callbacks
    const newActionNode: Node = {
      id: newActionId,
      type: "action",
      position: {
        x: lastActionNode.position.x,
        y: lastActionNode.position.y + 550,
      },
      data: {
        label: `Action ${nodes.length}`,
        nodeId: newActionId,
        onActionTypeChange: (
          actionId: string,
          actionName: string,
          metadata: Record<string, any>
        ) => {
          const newActions = [...selectActions];
          const newAction = {
            id: actionId,
            name: actionName,
            metadata: metadata || {},
          };

          // Add as a new action
          newActions.push(newAction);
          setSelectActions(newActions);
        },
        onMetadataChange: (actionId: string, metadata: Record<string, any>) => {
          const newActions = [...selectActions];
          // Find the index of this action by nodeId (can be different from the array index)
          const actionIndex = newActions.findIndex((a) => a.id === actionId);

          if (actionIndex >= 0) {
            newActions[actionIndex] = {
              ...newActions[actionIndex],
              metadata: metadata,
            };
          } else {
            // If not found, might be a new action
            newActions.push({
              id: actionId,
              name: "", // We don't know the name yet
              metadata: metadata,
            });
          }

          setSelectActions(newActions);
        },
      },
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
  }, [nodes, setNodes, setEdges, selectActions, finalTrigger]);

  // Handle workflow publishing
  const handlePublishWorkflow = async () => {
    const { id, name, metadata } = finalTrigger;

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
            workflow.workflow.id,
            selectActions,
            finalTrigger,
            workflowName,
            user?.id || "",
            token,
            sessionId || ""
          )
        : await publishWorkflow(
            selectActions,
            finalTrigger,
            workflowName,
            user?.id || "",
            token,
            sessionId || ""
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
          err.message || workflow?.workflow?.id
            ? "Error updating workflow"
            : "Error creating workflow",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle workflow running
  const handleRunWorkflow = async () => {
    // combine all the metadata from actions
    const actionMetadata = selectActions.reduce((acc, action) => {
      if (!action.metadata) return acc;

      const processedMetadata = Object.entries(action.metadata).reduce(
        (metaAcc, [key, value]) => {
          // checking if the value is a reference to trigger's metadata
          if (
            typeof value === "string" &&
            value.startsWith("{data.") &&
            value.endsWith("}")
          ) {
            // extract the key from the e.g:- {data.email} -> email
            const triggerKey = value.slice(6, -1);
            const actualValue = finalTrigger?.metadata?.[triggerKey];
            return {
              ...metaAcc,
              [key]: actualValue || value,
            };
          }
          return {
            ...metaAcc,
            [key]: value,
          };
        },
        {}
      );

      return {
        ...acc,
        ...processedMetadata,
      };
    }, {});

    try {
      const response = await api.post(
        `${process.env.NEXT_PUBLIC_WEBHOOK_URL}/hooks/${workflow?.workflow?.id}`,
        {
          data: actionMetadata,
        },
        {
          headers: {
            "x-webhook-secret": workflow?.webhookKey.secretKey || "",
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
      setTimeout(() => {
        router.push("/workflows");
      }, 1000);
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
      <div className="w-full py-2 px-4 sm:px-6">
        <div
          className="border rounded-xl p-2 bg-white/50 backdrop-blur-lg 
        w-full max-w-screen-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={() => router.push("/workflows")}
              className="p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-lg bg-white flex-grow sm:w-64"
              placeholder="Workflow Name"
            />
          </div>
          <div className="flex justify-center items-center gap-3 w-full sm:w-auto">
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
          nodeTypes={nodeTypes}
        >
          <Controls />
          <Background variant={"dots" as BackgroundVariant} gap={20} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
