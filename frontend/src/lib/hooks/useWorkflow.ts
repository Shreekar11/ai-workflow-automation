import { Workflow } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { getWorkFlow } from "../actions/workflow.action";
import { useToken } from "./useToken";

export function useWorkflow(id: string | string[]) {
  const { user } = useUser();
  const { token, sessionId } = useToken();
  const [loading, setLoading] = useState(true);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [webhookSecret, setWebhookSecret] = useState<string | null>("");
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflow = useCallback(async () => {
    if (!user?.id || !token || !id) {
      setLoading(false);
      return;
    }

    try {
      const response = await getWorkFlow(id, user.id, token, sessionId || "");

      if (!response.status) {
        throw new Error(response.message || "Error fetching workflow");
      }

      setWorkflow(response.data.workflow);
      setWebhookSecret(response.data.webhookSecret);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch workflow");
      console.error("Error fetching workflow:", err);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id, token, sessionId]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  return { loading, workflow, webhookSecret, error, refetch: fetchWorkflow };
}
