import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AddActionButton({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ position: "absolute", right: 10, bottom: 10, zIndex: 4 }}>
      <Button
        onClick={onClick}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Action
      </Button>
    </div>
  );
}
