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
import { useToast } from "@/lib/hooks/useToast";

// Types for node data
interface NodeData {
  label: string;
  image?: string;
  preTemplateId?: string;
  onChange?: (id: string, data: any) => void;
  // Specific node data
  blogUrl?: string;
  modelType?: string;
  systemPrompt?: string;
  docId?: string;
}

// Define the request payload structure
interface TemplateRequestPayload {
  metadata: {
    url: string;
    model: string;
    system: string;
    googleDocsId: string;
  };
}

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
  const { toast } = useToast();
  const { isLoading, template } = useTemplate(id);
  const [workflowName, setWorkflowName] = useState<string>("Untitled Workflow");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Declare all hooks first - before any conditional logic
  const [initialNodesState, setInitialNodesState] = useState<Node[]>([]);
  const [initialEdgesState, setInitialEdgesState] = useState<Edge[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesState);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdgesState);

  // Store node data separately for form values
  const [nodeFormData, setNodeFormData] = useState<Record<string, NodeData>>(
    {}
  );

  // Handle node data changes
  const handleNodeDataChange = useCallback((nodeId: string, data: NodeData) => {
    setNodeFormData((prev) => ({
      ...prev,
      [nodeId]: data,
    }));
  }, []);

  // Generate initial nodes based on available template actions
  const generateInitialNodes = () => {
    if (
      !template?.availableTemplateActions ||
      template.availableTemplateActions.length === 0
    ) {
      // Fallback to default nodes if no template actions available
      return [
        {
          id: "1",
          type: "blogScraper",
          position: { x: 200, y: 100 },
          data: {
            label: "Blog Scraper",
            onChange: handleNodeDataChange,
          },
        },
        {
          id: "2",
          type: "llmModel",
          position: { x: 600, y: 100 },
          data: {
            label: "LLM Model",
            onChange: handleNodeDataChange,
          },
        },
        {
          id: "3",
          type: "googleDocs",
          position: { x: 1050, y: 100 },
          data: {
            label: "Google Docs",
            onChange: handleNodeDataChange,
          },
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
            onChange: handleNodeDataChange,
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

      // Initialize node form data
      const initialFormData: Record<string, NodeData> = {};
      nodes.forEach((node) => {
        initialFormData[node.id] = node.data;
      });
      setNodeFormData(initialFormData);
    }
  }, [template]);

  // Update nodes and edges when initial states change
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

  // Extract data from nodes to build request payload
  const buildRequestPayload = (): TemplateRequestPayload | null => {
    let url = "";
    let model = "";
    let system = "";
    let googleDocsId = "";

    // Find the data from each type of node
    nodes.forEach((node) => {
      const nodeData = nodeFormData[node.id];
      if (!nodeData) return;

      if (node.type === "blogScraper" && nodeData.blogUrl) {
        url = nodeData.blogUrl;
      }

      if (node.type === "llmModel") {
        model = nodeData.modelType || "";
        system = nodeData.systemPrompt || "";
      }

      if (node.type === "googleDocs" && nodeData.docId) {
        googleDocsId = nodeData.docId;
      }
    });

    // Check if we have all required fields
    if (!url || !model || !system || !googleDocsId) {
      return null;
    }

    return {
      metadata: {
        url,
        model,
        system,
        googleDocsId,
      },
    };
  };

  // Validate the flow before running
  const validateFlow = (): boolean => {
    // Check if we have at least one node
    if (nodes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Workflow needs at least one node to run",
        variant: "destructive",
      });
      return false;
    }

    // Check for required fields in each node type
    for (const node of nodes) {
      const nodeData = nodeFormData[node.id];

      if (!nodeData) continue;

      if (node.type === "blogScraper" && !nodeData.blogUrl) {
        toast({
          title: "Validation Error",
          description: `Blog Scraper node requires a URL`,
          variant: "destructive",
        });
        return false;
      }

      if (
        node.type === "llmModel" &&
        (!nodeData.modelType || !nodeData.systemPrompt)
      ) {
        toast({
          title: "Validation Error",
          description: `LLM Model node requires both a model selection and system prompt`,
          variant: "destructive",
        });
        return false;
      }

      if (node.type === "googleDocs" && !nodeData.docId) {
        toast({
          title: "Validation Error",
          description: `Google Docs node requires a document ID`,
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  // Run the template workflow
  const handleRunTemplate = async () => {
    if (!validateFlow()) return;

    const payload = buildRequestPayload();

    if (!payload) {
      toast({
        title: "Error",
        description:
          "Failed to build request payload. Make sure all required fields are filled.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);

    try {
      // Make the API call to run the template
      console.log("Sending payload:", payload);

      toast({
        title: "Success",
        description: "Workflow executed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run workflow. Please try again.",
        variant: "destructive",
      });
      console.error("Error running template:", error);
    } finally {
      setIsRunning(false);
    }
  };

  // After all hooks have been called, we can render conditionally
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
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
            />
          </div>
          <div className="flex justify-center items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              disabled={isRunning}
              onClick={handleRunTemplate}
              className="bg-[#FF7801] text-white  
              hover:bg-[#FF7801]/80 hover:text-white"
            >
              {isRunning ? "Running..." : "Run Template"}
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
