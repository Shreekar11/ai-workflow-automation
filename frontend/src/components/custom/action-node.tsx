import { Handle, Position } from "reactflow";

export default function ActionNode({
  data,
}: {
  data: { label: string; selectedOption?: string };
}) {
  return (
    <div className="p-2 shadow-md rounded-md bg-white border-2 border-blue-400 w-72">
        <div className="px-6 py-4 rounded-md bg-blue-100">
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-blue-500"
      />
      <div className="font-bold text-lg mb-2">{data.label}</div>
      {data.selectedOption && (
        <div className="text-sm text-gray-600 font-bold">{data.selectedOption}</div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-blue-500"
      />
      </div>
    </div>
  );
}
