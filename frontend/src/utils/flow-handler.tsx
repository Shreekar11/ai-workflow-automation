import { ActionType, TriggerType, Workflow } from "@/types";
import { FileSpreadsheet, Mail, Webhook } from "lucide-react";
import { Edge, Node } from "reactflow";

// Helper function to handle callback function for updating Nodes data betweeb components and creating Nodes
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
          onMetadataChange: (
            actionId: string,
            metadata: Record<string, any>
          ) => {
            setSelectActions([
              {
                id: actionId,
                name: selectActions[0]?.name || "",
                metadata: metadata,
              },
            ]);
          },
        },
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
        selectedOption: {
          icon: <Webhook />,
          metadata: workflow.workflow.trigger.metadata,
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
      },
    },
  ];

  workflow.workflow.actions.forEach((action, index) => {
    const nodeId = `action${index + 1}`;
    nodes.push({
      id: nodeId,
      type: "action",
      position: { x: 600, y: 350 + index * 250 },
      data: {
        label: `Action ${index + 1}`,
        nodeId: nodeId,
        selectedOption: {
          icon: action.type.name === "Email" ? <Mail /> : <FileSpreadsheet />,
          metadata: action.metadata || {},
          name: action.type.name || "",
        },
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

          const nodeIndex = index;
          if (nodeIndex < newActions.length) {
            newActions[nodeIndex] = newAction;
          } else {
            newActions.push(newAction);
          }

          setSelectActions(newActions);
        },
        onMetadataChange: (actionId: string, metadata: Record<string, any>) => {
          const newActions = [...selectActions];
          const nodeIndex = index;

          if (nodeIndex < newActions.length) {
            newActions[nodeIndex] = {
              ...newActions[nodeIndex],
              metadata: metadata,
            };
            setSelectActions(newActions);
          }
        },
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
      animated: true,
    });
    previousNodeId = currentNodeId;
  });

  return edges;
};
