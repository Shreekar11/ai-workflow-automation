// icon and component
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddActionButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="">
      <Button
        onClick={onClick}
        className="text-black bg-white border font-bold py-2 px-4 rounded-lg shadow-md hover:bg-white/40"
      >
        <PlusCircle className="text-black mr-2 h-4 w-4" /> Add Action
      </Button>
    </div>
  );
}
