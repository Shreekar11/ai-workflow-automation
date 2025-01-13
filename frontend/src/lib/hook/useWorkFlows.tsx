import { api } from "@/app/api/client";
import { Workflow } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useWorkflows() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  const fetchWorkflows = async () => {
    try {
      if (!user?.id) {
        return; 
      }

      const response = await api.get("/api/v1/workflow", {
        headers: {
          "clerk-user-id": user.id,
        },
      });

      const data = response.data;
      setWorkflows(data.data);
    } catch (err) {
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