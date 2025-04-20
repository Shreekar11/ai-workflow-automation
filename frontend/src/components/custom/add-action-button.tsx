// icon and component
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddActionButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="">
      <Button
        variant="outline"
        onClick={onClick}
        className="bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
      >
        <PlusCircle className="text-black mr-2 h-4 w-4" /> Add Action
      </Button>
    </div>
  );
}
