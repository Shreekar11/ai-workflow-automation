import { Handle, Position } from "reactflow";

export default function TriggerNode({
  data,
}: {
  data: { label: string; selectedOption?: string };
}) {
  return (
    <div className="p-2 shadow-md rounded-md border-2 bg-white border-violet-400 w-72">
        <div className="rounded-md px-6 py-4 bg-violet-100">
      <div className="font-bold text-lg mb-2 ">{data.label}</div>
      {data.selectedOption && (
        <div className="text-sm text-gray-600 font-bold">{data.selectedOption}</div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-violet-500"
      />
      </div>
    </div>
  );
}
