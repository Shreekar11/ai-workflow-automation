"use client";

import {
  buildRunRequestPayload,
  buildTemplatePayload,
} from "@/utils/metadata-handler";
import { useUser } from "@clerk/nextjs";
import { useToken } from "@/lib/hooks/useToken";
import { useToast } from "@/lib/hooks/useToast";
import { useTemplate } from "@/lib/hooks/useTemplate";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { validateFlow, validateRunFlow } from "@/utils/validation";
import { runTemplate, saveTemplate } from "@/lib/actions/template.action";

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
  type BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, X } from "lucide-react";

import CustomEdge from "@/components/node/template-edge";
import LLMModelNode from "@/components/node/llm-model-node";
import GoogleDocsNode from "@/components/node/google-docs-node";
import BlogScraperNode from "@/components/node/blog-scraper-node";
import LinkedinScraperNode from "@/components/node/linkedin-scraper-node";
import { blogScraperId, googleDocsId, llmModelId } from "@/lib/config";

// Types for node data
interface NodeData {
  label: string;
  image?: string;
  preTemplateId?: string;
  availableActionId?: string;
  onChange?: (id: string, data: any) => void;
  url?: string;
  model?: string;
  system?: string;
  googleDocsId?: string;
}

const nodeTypes: NodeTypes = {
  blogScraper: BlogScraperNode,
  llmModel: LLMModelNode,
  googleDocs: GoogleDocsNode,
  linkedinScraper: LinkedinScraperNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const getNodeTypeFromName = (name: string): string => {
  if (name.includes("Scraper")) {
    const scraperType = name.replace("Scraper", "").trim().toLowerCase();
    return `${scraperType}Scraper`;
  }

  const nameToType: Record<string, string> = {
    "LLM Model": "llmModel",
    "Google Docs": "googleDocs",
  };

  return nameToType[name] || "blogScraper";
};

export default function FlowPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { user } = useUser();
  const { toast } = useToast();
  const { token, sessionId } = useToken();
  const { isLoading, template } = useTemplate(id);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [templateName, setTemplateName] = useState<string>("Untitled Workflow");
  const [runResult, setRunResult] = useState<any>(null);

  const hasTemplate = Boolean(template?.template?.id);

  const [initialNodesState, setInitialNodesState] = useState<Node[]>([]);
  const [initialEdgesState, setInitialEdgesState] = useState<Edge[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesState);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdgesState);

  const [nodeFormData, setNodeFormData] = useState<Record<string, NodeData>>(
    {}
  );

  const handleNodeDataChange = useCallback((nodeId: string, data: NodeData) => {
    setNodeFormData((prev) => ({
      ...prev,
      [nodeId]: data,
    }));
  }, []);

  // Generate initial nodes based on available template actions with metadata if available
  const generateInitialNodes = () => {
    if (
      !template?.availableTemplateActions ||
      template.availableTemplateActions.length === 0
    ) {
      return [
        {
          id: "1",
          type: "blogScraper",
          position: { x: 250, y: 50 },
          data: {
            label: "Blog Scraper",
            availableActionId: blogScraperId,
            onChange: handleNodeDataChange,
          },
        },
        {
          id: "2",
          type: "llmModel",
          position: { x: 250, y: 250 },
          data: {
            label: "LLM Model",
            availableActionId: llmModelId,
            onChange: handleNodeDataChange,
          },
        },
        {
          id: "3",
          type: "googleDocs",
          position: { x: 250, y: 450 },
          data: {
            label: "Google Docs",
            availableActionId: googleDocsId,
            onChange: handleNodeDataChange,
          },
        },
      ];
    }
    // Calculate horizontal spacing based on number of nodes
    const spacing = 350;
    const startY = 10;
    const baseX = 600;
    const middleNodeOffset = 150;

    const nodeValues = template.availableTemplateActions.map(
      (action, index) => {
        let metadata = {};
        if (hasTemplate && action.actions && action.actions.length > 0) {
          metadata = action.actions[0].metadata || {};
        }

        const nodeCount = template.availableTemplateActions.length;
        let xPosition = baseX;

        if (nodeCount === 3 && index === 1) {
          xPosition += middleNodeOffset;
        }

        return {
          id: action.id,
          type: getNodeTypeFromName(action.name),
          position: { x: xPosition, y: startY + index * spacing },
          data: {
            label: action.name,
            image: action.image,
            preTemplateId: action.preTemplateId,
            availableActionId: action.id,
            onChange: handleNodeDataChange,
            ...(metadata as any),
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

      if (template.name) {
        setTemplateName(template.name);
      }
    }
  }, [template, id]);

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

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    if (!validateFlow(templateName, nodes)) {
      setIsSaving(false);
      toast({
        title: "Validation Error",
        description: "Add the required fields in the node",
        variant: "destructive",
      });
      return;
    }

    const payload = buildTemplatePayload(
      template,
      templateName,
      nodes,
      nodeFormData
    );

    try {
      const result = await saveTemplate(
        payload,
        user?.id || "",
        token,
        sessionId || ""
      );

      toast({
        title: "Success",
        description: "Workflow saved successfully!",
        variant: "success",
      });

      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunTemplate = async () => {
    if (!validateRunFlow(templateName, nodes, nodeFormData)) {
      toast({
        title: "Validation Error",
        description: `Add the required fields in the node`,
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);

    try {
      const payload = buildRunRequestPayload(nodes, nodeFormData);

      if (!payload) {
        toast({
          title: "Error",
          description: "Failed to build run request. Please check your inputs.",
          variant: "destructive",
        });
        return;
      }

      const result = await runTemplate(
        template?.template?.id || "",
        payload,
        user?.id || "",
        token,
        sessionId || ""
      );

      setRunResult(result);

      toast({
        title: "Success",
        description: "Workflow executed successfully!",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run template. Please try again.",
        variant: "destructive",
      });
      console.error("Error running template:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const renderOutputButton = () => {
    const hasMetadata =
      template?.availableTemplateActions?.some(
        (action) =>
          action.actions?.[0]?.metadata &&
          Object.keys(action.actions[0].metadata).length > 0
      ) ||
      (runResult && Object.keys(runResult).length > 0);

    if (!hasMetadata) return null;

    return (
      <Button
        className="bg-white shadow-md hover:bg-gray-100"
        variant="outline"
        onClick={() => setShowOutput(!showOutput)}
      >
        {showOutput ? "Hide Output" : "View Output"}
      </Button>
    );
  };

  const renderOutputPanel = () => {
    const results = template?.template.templateResults || [];
    const hasMetadata = results.some(
      (result) => result?.metadata && Object.keys(result.metadata).length > 0
    );

    if (!hasMetadata) return null;

    return (
      <div className="absolute top-0 right-0 bottom-0 w-[400px] bg-white border-l border-gray-200 shadow-lg z-20 overflow-hidden">
        <div className="h-full w-full overflow-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Template Output</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOutput(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <Accordion type="multiple" className="space-y-2">
            {results.map((result, index) => {
              const scraper_result = result?.metadata?.scraper_result?.content;
              const llm_result = result?.metadata?.llmmodel_result?.result;
              const google_result =
                result?.metadata?.google_docs_result?.documentUrl;

              const metadata = {
                scraper_result,
                llm_result,
                google_result,
              };

              const metadataKeys = Object.keys(metadata).filter(
                (key) => (metadata as any)[key]
              );

              if (metadataKeys.length === 0) return null;

              return (
                <AccordionItem key={index} value={`result-${index}`}>
                  <AccordionTrigger>Result {index + 1}</AccordionTrigger>
                  <AccordionContent>
                    <Tabs defaultValue={metadataKeys[0]} className="mt-2">
                      <TabsList className="mb-4">
                        {metadataKeys.map((key) => (
                          <TabsTrigger key={key} value={key}>
                            {key}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {metadataKeys.map((key) => (
                        <TabsContent key={key} value={key}>
                          {typeof (metadata as any)[key] === "object" ? (
                            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[300px] text-sm">
                              {JSON.stringify((metadata as any)[key], null, 2)}
                            </pre>
                          ) : (
                            <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[300px] text-sm">
                              {String((metadata as any)[key])}
                            </div>
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    );
  };

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
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-auto flex justify-center items-center gap-2">
            {template.template && renderOutputButton()}

            {!hasTemplate ? (
              <Button
                variant="outline"
                disabled={isSaving}
                onClick={handleSaveTemplate}
                className="bg-white text-gray-800 border-gray-300
                hover:bg-gray-100"
              >
                Save Template
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  disabled={isRunning}
                  onClick={handleRunTemplate}
                  className="bg-[#FF7801] text-white
                  hover:bg-[#FF7801]/80 hover:text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isRunning ? "Running..." : "Run Template"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <div className="w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView={true}
            fitViewOptions={{
              padding: 0.5,
              minZoom: 0.5,
              maxZoom: 1.5,
            }}
            defaultViewport={{
              x: 0,
              y: 0,
              zoom: 0.7,
            }}
          >
            <Controls />
            <Background
              variant={"dots" as BackgroundVariant}
              gap={20}
              size={1}
            />
          </ReactFlow>
        </div>

        {showOutput && renderOutputPanel()}
      </div>
    </div>
  );
}
