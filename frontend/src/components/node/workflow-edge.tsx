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
  let edgeColor = "#10B981"

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

