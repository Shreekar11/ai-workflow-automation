import { Workflow } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getWorkFlow } from "../actions/workflow.action";

export function useWorkflow(id: string | string[]) {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);

  const fetchWorkflow = async () => {
    try {
      if (!user?.id) {
        return;
      }
      const response = await getWorkFlow(id, user.id);
      if (!response.status) {
        throw new Error(response.message || "Error fetching workflows");
      }
      const data = response.data;
      setWorkflow(data);
    } catch (err: any) {
      console.error("Error fetching workflows:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
  }, [user?.id]);

  return { loading, workflow };
}
