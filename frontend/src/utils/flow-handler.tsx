import { Edge, Node } from "reactflow";
import { ActionType, TriggerType, Workflow } from "@/types";
import { FileSpreadsheet, Mail, Webhook } from "lucide-react";

// Helper function to handle callback function for updating Nodes data between components and creating Nodes
export const createInitialNodes = (
  workflow: Workflow | null | undefined,
  setFinalTrigger: React.Dispatch<React.SetStateAction<TriggerType>>,
  selectActions: ActionType[],
  setSelectActions: React.Dispatch<React.SetStateAction<ActionType[]>>
): Node[] => {
  if (!workflow) {
    return [
      {
        id: "trigger",
        type: "trigger",
        position: { x: 600, y: 100 },
        data: {
          label: "Trigger",
          onTriggerTypeChange: (
            triggerId: string,
            triggerName: string,
            metadata: Record<string, any>
          ) => {
            setFinalTrigger({
              id: triggerId,
              name: triggerName,
              metadata: metadata || {},
            });
          },
          onMetadataChange: (metadata: Record<string, any>) => {
            setFinalTrigger((prev) => ({
              ...prev,
              metadata: metadata,
            }));
          },
        },
      },
      {
        id: "action1",
        type: "action",
        position: { x: 600, y: 350 },
        data: {
          label: "Action 1",
          nodeId: "action1",
          onActionTypeChange: (
            actionId: string,
            actionName: string,
            metadata: Record<string, any>
          ) => {
            const newAction = {
              id: actionId,
              name: actionName,
              metadata: metadata || {},
            };

            setSelectActions([newAction]);
          },
          onMetadataChange: (nodeId: string, metadata: Record<string, any>) => {
            console.log(`Updating metadata for node ${nodeId}:`, metadata);

            const actionIndex = parseInt(nodeId.replace("action", "")) - 1;

            // Get the current actions array to avoid stale state
            setSelectActions((currentActions) => {
              if (currentActions.length === 0) {
                return [
                  {
                    id: "",
                    name: "",
                    metadata: metadata,
                  },
                ];
              }

              if (actionIndex >= 0 && actionIndex < currentActions.length) {
                const newActions = [...currentActions];
                newActions[actionIndex] = {
                  ...newActions[actionIndex],
                  metadata: metadata,
                };
                return newActions;
              } else {
                console.error(
                  `Invalid action index: ${actionIndex} for nodeId: ${nodeId}`
                );
                return currentActions;
              }
            });
          },
        },
      },
    ];
  }

  // Initialize with workflow data
  const nodes: Node[] = [
    {
      id: "trigger",
      type: "trigger",
      position: { x: 600, y: 50 },
      data: {
        label: "Trigger",
        selectedOption: {
          icon: <Webhook />,
          metadata: workflow.workflow.trigger.metadata || {},
          name: workflow.workflow.trigger.type.name,
        },
        onTriggerTypeChange: (
          triggerId: string,
          triggerName: string,
          metadata: Record<string, any>
        ) => {
          setFinalTrigger({
            id: triggerId,
            name: triggerName,
            metadata: metadata || {},
          });
        },
        onMetadataChange: (metadata: Record<string, any>) => {
          setFinalTrigger((prev) => ({
            ...prev,
            metadata: metadata,
          }));
        },
        workflowId: workflow.workflow.id,
      },
    },
  ];

  workflow.workflow.actions.forEach((action, index) => {
    const nodeId = `action${index + 1}`;
    nodes.push({
      id: nodeId,
      type: "action",
      position: { x: 600, y: 450 + index * 250 },
      data: {
        label: `Action ${index + 1}`,
        nodeId: nodeId,
        selectedOption: {
          icon: action.type.name === "Email" ? <Mail /> : <FileSpreadsheet />,
          metadata: action.metadata || {},
          name: action.type.name || "",
          image: action.type.image,
        },
        onActionTypeChange: (
          actionId: string,
          actionName: string,
          metadata: Record<string, any>
        ) => {
          setSelectActions((currentActions) => {
            const newActions = [...currentActions];
            const newAction = {
              id: actionId,
              name: actionName,
              metadata: metadata || {},
            };

            if (index < newActions.length) {
              newActions[index] = newAction;
            } else {
              newActions.push(newAction);
            }

            return newActions;
          });
        },
        onMetadataChange: (nodeId: string, metadata: Record<string, any>) => {
          const actionIndex = parseInt(nodeId.replace("action", "")) - 1;

          setSelectActions((currentActions) => {
            if (actionIndex >= 0 && actionIndex < currentActions.length) {
              const newActions = [...currentActions];
              newActions[actionIndex] = {
                ...newActions[actionIndex],
                metadata: metadata,
              };
              return newActions;
            } else {
              console.error(
                `Invalid action index: ${actionIndex} for nodeId: ${nodeId}`
              );
              return currentActions;
            }
          });
        },
        workflowId: workflow.workflow.id,
      },
    });
  });

  return nodes;
};

export const createInitialEdges = (workflow?: Workflow | null): Edge[] => {
  if (!workflow) {
    return [
      {
        id: "e-trigger-action1",
        source: "trigger",
        target: "action1",
        type: "workflow",
        animated: true,
      },
    ];
  }

  const edges: Edge[] = [];
  let previousNodeId = "trigger";

  workflow.workflow.actions.forEach((_, index) => {
    const currentNodeId = `action${index + 1}`;
    edges.push({
      id: `e-${previousNodeId}-${currentNodeId}`,
      source: previousNodeId,
      target: currentNodeId,
      type: "workflow",
      animated: true,
    });
    previousNodeId = currentNodeId;
  });

  return edges;
};
