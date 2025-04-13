"use client";

import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  type Node,
  type Edge,
  addEdge,
  Background,
  Controls,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";

import BlogScraperNode from "@/components/node/blog-scraper-node";
import LLMModelNode from "@/components/node/llm-model-node";
import GoogleDocsNode from "@/components/node/google-docs-node";
import CustomEdge from "@/components/node/edge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { useTemplate } from "@/lib/hooks/useTemplate";

const nodeTypes: NodeTypes = {
  blogScraper: BlogScraperNode,
  llmModel: LLMModelNode,
  googleDocs: GoogleDocsNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const getNodeTypeFromName = (name: string): string => {
  const nameToType = {
    Scraper: "blogScraper",
    "LLM Model": "llmModel",
    "Google Docs": "googleDocs",
  };

  return (nameToType as any)[name] || "blogScraper"; // Default to blogScraper if not found
};

export default function FlowPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { isLoading, template } = useTemplate(id);

  const [initialNodesState, setInitialNodesState] = useState<Node[]>([]);
  const [initialEdgesState, setInitialEdgesState] = useState<Edge[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesState);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdgesState);

  // Generate initial nodes based on available template actions
  const generateInitialNodes = () => {
    if (
      !template?.availableTemplateActions ||
      template.availableTemplateActions.length === 0
    ) {
    
      return [
        {
          id: "1",
          type: "blogScraper",
          position: { x: 200, y: 100 },
          data: { label: "Blog Scraper" },
        },
        {
          id: "2",
          type: "llmModel",
          position: { x: 600, y: 100 },
          data: { label: "LLM Model" },
        },
        {
          id: "3",
          type: "googleDocs",
          position: { x: 1050, y: 100 },
          data: { label: "Google Docs" },
        },
      ];
    }

    // Calculate horizontal spacing based on number of nodes
    const spacing = 450;
    const startX = 200;
    const y = 100;

    const nodeValues = template.availableTemplateActions.map(
      (action, index) => {
        return {
          id: action.id,
          type: getNodeTypeFromName(action.name),
          position: { x: startX + index * spacing, y },
          data: {
            label: action.name,
            image: action.image,
            preTemplateId: action.preTemplateId,
          },
        };
      }
    );

    return nodeValues;
  };

  // Generate initial edges connecting nodes in sequence
  const generateInitialEdges = (nodes: Node[]) => {
    if (nodes.length <= 1) return [];

    return nodes.slice(0, -1).map((node, index) => {
      const sourceId = node.id;
      const targetId = nodes[index + 1].id;

      return {
        id: `e${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        type: "custom",
        animated: true,
      };
    });
  };

  useEffect(() => {
    if (template?.availableTemplateActions) {
      const nodes = generateInitialNodes();
      setInitialNodesState(nodes);
      setInitialEdgesState(generateInitialEdges(nodes));
    }
  }, [template]);

  useEffect(() => {
    setNodes(initialNodesState);
    setEdges(initialEdgesState);
  }, [initialNodesState, initialEdgesState, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge({ ...connection, type: "custom", animated: true }, eds)
      );
    },
    [setEdges]
  );

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="relative w-12 h-12" role="status" aria-label="Loading">
          <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-[#FFE0C2] rounded-full"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-[#FF7801] rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>
    );
  }

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
              onClick={() => router.push("/templates")}
              className="p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Input
              type="text"
              className="text-lg bg-white flex-grow sm:w-64"
              placeholder="Workflow Name"
            />
          </div>
          <div className="flex justify-center items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              //   disabled={isLoading}
              //   onClick={handlePublishWorkflow}
              className="bg-[#FF7801] text-white  
              hover:bg-[#FF7801]/80 hover:text-white"
            >
              Run Template
            </Button>
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
          edgeTypes={edgeTypes}
        >
          <Controls />
          <Background variant={"dots" as BackgroundVariant} gap={20} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
