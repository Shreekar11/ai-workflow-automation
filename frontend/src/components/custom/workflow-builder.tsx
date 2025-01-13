"use client";

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
import TriggerNode from "./trigger-node";
import ActionNode from "./action-node";
import AddActionButton from "./add-action-button";
import SelectDialog from "./select-dialog";

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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
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

    setNodes((nds) => [...nds, newActionNode]);
    setEdges((eds) => [
      ...eds,
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
    (option: string) => {
      if (selectedNode) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === selectedNode.id
              ? { ...node, data: { ...node.data, selectedOption: option } }
              : node
          )
        );
      }
      handleCloseDialog();
    },
    [selectedNode, setNodes]
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
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
        <AddActionButton onClick={handleAddAction} />
      </ReactFlow>
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
