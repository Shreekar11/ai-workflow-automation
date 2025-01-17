import { ReactNode, useEffect, useState } from "react";
import { Handle, Position } from "reactflow";

const resolveValue = (value: any, triggerMetadata: Record<string, any>) => {
  if (typeof value === "string" && value.startsWith("{data.")) {
    const fieldKey = value.replace("{data.", "").replace("}", "");
    return triggerMetadata[fieldKey] || value;
  }
  return value;
};

export default function ActionNode({
  data,
}: {
  data: {
    label: string;
    selectedOption?: {
      icon: ReactNode;
      metadata: any;
      name: string;
      triggerMetadata?: Record<string, any>;
    };
  };
}) {
  const [displayMetadata, setDisplayMetadata] = useState<Record<string, any>>(
    {}
  );

  useEffect(() => {
    if (data.selectedOption?.metadata) {
      const resolvedMetadata = Object.fromEntries(
        Object.entries(data.selectedOption.metadata)
          .filter(([key, value]) => key && value)
          .map(([key, value]) => [
            key,
            resolveValue(value, data.selectedOption?.triggerMetadata || {}),
          ])
      );
      setDisplayMetadata(resolvedMetadata);
    } else {
      setDisplayMetadata({});
    }
  }, [data.selectedOption]);

  return (
    <div className="p-2 shadow-md rounded-md bg-white border-2 border-blue-400 w-96">
      <div className="px-6 py-4 rounded-md bg-blue-100">
        <Handle
          type="target"
          position={Position.Top}
          className="w-16 !bg-blue-500"
        />
        <div className="font-bold text-lg mb-2 break-words">{data.label}</div>
        {data.selectedOption && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
              {data.selectedOption.icon}
              <span className="break-words">{data.selectedOption.name}</span>
            </div>
            {Object.keys(displayMetadata).length > 0 && (
              <div className="bg-white rounded-md p-2 text-sm space-y-1 max-h-[200px] overflow-y-auto">
                {Object.entries(displayMetadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-[1fr,2fr] gap-4 items-start"
                  >
                    <span className="text-gray-600 font-medium">{key}:</span>
                    <span className="text-gray-800 break-words">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
