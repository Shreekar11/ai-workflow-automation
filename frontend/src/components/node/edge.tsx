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

  // Determine edge color based on source and target
  let edgeColor = "#10b981"

  if (source === "1" && target === "2") {
    edgeColor = "#f59e0b" // amber for blog scraper to LLM
  } else if (source === "2" && target === "3") {
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

