import { Handle, Position } from "reactflow";

export default function ConnectorNode() {
  return (
    <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !bg-gray-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-gray-500"
      />
    </div>
  );
}
