"use client";

import { useCallback } from "react";
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
import { useRouter } from "next/navigation";

const nodeTypes: NodeTypes = {
  blogScraper: BlogScraperNode,
  llmModel: LLMModelNode,
  googleDocs: GoogleDocsNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const initialNodes: Node[] = [
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

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "custom",
    animated: true,
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: "custom",
    animated: true,
  },
];

export default function FlowPage() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge({ ...connection, type: "custom", animated: true }, eds)
      );
    },
    [setEdges]
  );

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
              Run Tempalte
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
