import { ReactNode, useEffect, useState } from "react";
import { Handle, Position } from "reactflow";

export default function TriggerNode({
  data,
}: {
  data: {
    label: string;
    selectedOption?: {
      icon: ReactNode;
      metadata: any;
      name: string;
    };
  };
}) {
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  useEffect(() => {
    if (data.selectedOption && data.selectedOption.metadata) {
      const metadataObject = Object.fromEntries(
        Object.entries(data.selectedOption.metadata).filter(
          ([key, value]) => key && value
        )
      );
      setMetadata(metadataObject);
    } else {
      setMetadata({});
    }
  }, [data.selectedOption]);

  return (
    <div className="p-2 shadow-md rounded-md border-2 bg-white border-violet-400 min-w-[18rem] max-w-md">
      <div className="rounded-md px-6 py-4 bg-violet-100">
        <div className="font-bold text-lg mb-2 break-words">{data.label}</div>
        {data.selectedOption && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
              {data.selectedOption.icon}
              <span className="break-words">{data.selectedOption.name}</span>
            </div>
            {Object.keys(metadata).length > 0 && (
              <div className="bg-white rounded-md p-2 text-sm space-y-1 max-h-[200px] overflow-y-auto">
                {Object.entries(metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-[auto,1fr] gap-2 items-start"
                  >
                    <span className="text-gray-600 font-medium whitespace-nowrap">
                      {key}:
                    </span>
                    <span className="text-gray-800 break-words text-right">
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
          className="w-16 !bg-violet-500"
        />
      </div>
    </div>
  );
}
