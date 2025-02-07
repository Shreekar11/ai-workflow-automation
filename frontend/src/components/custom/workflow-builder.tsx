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
import { PulsatingButton } from "../ui/pulsating-button";
import { ArrowLeft, FileSpreadsheet, Mail, Webhook } from "lucide-react";

import NodeCard from "./node-card";
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

  const [selectTrigger, setSelectTrigger] = useState<TriggerType>({
    id: workflow?.triggerId || "",
    name: workflow?.trigger?.type?.name || "",
    metadata: {},
  });

  const [actionData, setActionData] = useState<ActionType[]>([]);
  const [selectActions, setSelectActions] = useState<ActionType[]>(
    actionData || []
  );

  const [finalTrigger, setFinalTrigger] = useState<TriggerType>({
    id: workflow?.triggerId || "",
    name: workflow?.trigger?.type?.name || "",
    metadata: {},
  });

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
      setFinalTrigger(trigger_data);
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
    (option: {
      id: string;
      type: string;
      name: string;
      metadata: Record<string, string>;
      data: Record<string, string>;
    }) => {
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
        setFinalTrigger({
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
                    triggerMetadata: option.data || workflow?.trigger.metadata,
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
    const { id, name, metadata } = finalTrigger;

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

    const filteredActions = selectActions.map((action) => ({
      ...action,
      metadata: Object.fromEntries(
        Object.entries(action.metadata)
          .filter(([_, value]) => value !== "")
          .map(([actionKey, actionValue]) => {
            if (
              typeof actionValue === "string" &&
              actionValue.match(/{data\.[^}]+}/)
            ) {
              const match = actionValue.match(/{data\.([^}]+)}/);
              if (match) {
                const oldKey = match[1];

                if (finalTrigger.metadata && oldKey in finalTrigger.metadata) {
                  return [
                    actionKey,
                    actionValue.replace(
                      `{data.${oldKey}}`,
                      `{data.${actionKey}}`
                    ),
                  ];
                }
              }
            }
            return [actionKey, actionValue];
          })
      ),
    }));

    try {
      let response;

      response = workflow
        ? await updateWorkflow(
            workflow.id,
            filteredActions,
            finalTrigger,
            workflowName,
            user?.id || "",
            token,
            sessionId || ""
          )
        : await publishWorkflow(
            filteredActions,
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
          err.message || workflow
            ? "Error updating workflow"
            : "Error creating workflow",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        `${process.env.NEXT_PUBLIC_WEBHOOK_URL}/hooks/${workflow?.id}`,
        {
          data: actionMetadata,
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
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
        >
          <Controls />
          <Background variant={"dots" as BackgroundVariant} gap={20} size={1} />
          {!!selectedNode && (
            <div className="absolute top-10 right-32 h-full w-96 z-10">
              <NodeCard
                workflow={workflow || null}
                selectTrigger={selectTrigger}
                setSelectTrigger={setSelectTrigger}
                finalTrigger={finalTrigger}
                setFinalTrigger={setFinalTrigger}
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
