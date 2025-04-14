"use client"

import { BaseEdge, type EdgeProps, getStraightPath } from "reactflow"

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  source,
  target,
}: EdgeProps) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    // sourcePosition,
    targetX,
    targetY,
    // targetPosition,
  })

  console.log(source);

  // Determine edge color based on source and target
  let edgeColor = "#10b981"

  if (source === "1174ec54-91a4-4b0e-bd60-7bc438b2e3b4" && target === "de560ec9-eba5-4aaf-a30b-863817dfedc4") {
    edgeColor = "#f59e0b" // amber for blog scraper to LLM
  } else if (source === "de560ec9-eba5-4aaf-a30b-863817dfedc4") {
    edgeColor = "#ef4444" // red for LLM to Google Docs
  }

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        strokeWidth: 2,
        stroke: edgeColor,
      }}
    />
  )
}

