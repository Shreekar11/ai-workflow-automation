import { Workflow } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getAllUsersWorkFlow } from "../actions/workflow.action";

export function useWorkflows() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  const fetchWorkflows = async () => {
    try {
      if (!user?.id) {
        return;
      }
      const response = await getAllUsersWorkFlow(user.id);
      if (!response.status) {
        throw new Error(response.message || "Error fetching workflows");
      }
      const data = response.data;
      setWorkflows(data);
    } catch (err: any) {
      console.error("Error fetching workflows:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [user?.id]);

  return { loading, workflows, setWorkflows };
}
