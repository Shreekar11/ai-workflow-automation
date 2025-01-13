// icon and component
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddActionButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="">
      <Button
        onClick={onClick}
        className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Action
      </Button>
    </div>
  );
}
