import { Workflow } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { getAllUsersWorkFlow } from "../actions/workflow.action";
import { useToken } from "./useToken";

interface UseWorkflowsReturn {
  workflows: Workflow[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setWorkflows: React.Dispatch<React.SetStateAction<Workflow[]>>;
}

export function useWorkflows(): UseWorkflowsReturn {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isLoading: isTokenLoading, token, sessionId } = useToken();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  const fetchWorkflows = useCallback(async () => {
    setError(null);

    if (!isUserLoaded || isTokenLoading) {
      return;
    }

    if (!user?.id || !token || !sessionId) {
      setIsLoading(false);
      setError(new Error("Authentication required"));
      return;
    }

    try {
      setIsLoading(true);
      const response = await getAllUsersWorkFlow(user.id, token, sessionId);

      if (!response.status) {
        throw new Error(response.message || "Failed to fetch workflows");
      }

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid workflow data received");
      }

      setWorkflows(response.data);
    } catch (err) {
      console.error("Error fetching workflows:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch workflows")
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, token, sessionId, isUserLoaded, isTokenLoading]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const retryWithBackoff = useCallback(
    async (maxRetries: number = 3) => {
      let retryCount = 0;
      const retry = async () => {
        try {
          await fetchWorkflows();
          setError(null);
        } catch (err) {
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
            await new Promise((resolve) => setTimeout(resolve, delay));
            await retry();
          } else {
            setError(
              new Error("Failed to fetch workflows after multiple attempts")
            );
          }
        }
      };
      await retry();
    },
    [fetchWorkflows]
  );

  const refetch = useCallback(async () => {
    try {
      await retryWithBackoff();
    } catch (err) {
      console.error("Failed to refetch workflows:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to refetch workflows")
      );
    }
  }, [retryWithBackoff]);

  return {
    workflows,
    isLoading: isLoading || isTokenLoading || !isUserLoaded,
    error,
    refetch,
    setWorkflows,
  };
}
