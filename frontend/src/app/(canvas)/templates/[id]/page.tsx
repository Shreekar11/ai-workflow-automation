"use client"

import { useCallback } from "react"
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
} from "reactflow"
import "reactflow/dist/style.css"

import BlogScraperNode from "@/components/node/blog-scraper-node"
import LLMModelNode from "@/components/node/llm-model-node"
import GoogleDocsNode from "@/components/node/google-docs-node"
import CustomEdge from "@/components/node/edge"

const nodeTypes: NodeTypes = {
  blogScraper: BlogScraperNode,
  llmModel: LLMModelNode,
  googleDocs: GoogleDocsNode,
}

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

const initialNodes: Node[] = [
  {
    id: "1",
    type: "blogScraper",
    position: { x: 100, y: 100 },
    data: { label: "Blog Scraper" },
  },
  {
    id: "2",
    type: "llmModel",
    position: { x: 400, y: 100 },
    data: { label: "LLM Model" },
  },
  {
    id: "3",
    type: "googleDocs",
    position: { x: 700, y: 100 },
    data: { label: "Google Docs" },
  },
]

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
]

export default function FlowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, type: "custom", animated: true }, eds))
    },
    [setEdges],
  )

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
