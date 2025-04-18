import { RunType } from "@/types";
import { useToken } from "./useToken";
import { useUser } from "@clerk/nextjs";
import { getAllUserRuns } from "../actions/runs.action";
import { useCallback, useEffect, useState } from "react";

interface UseRunsReturn {
  runs: RunType;
  isLoading: boolean;
  error: Error | null;
  setRuns: React.Dispatch<React.SetStateAction<RunType>>;
}

export function useRuns(): UseRunsReturn {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isLoading: isTokenLoading, token, sessionId } = useToken();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [runs, setRuns] = useState<RunType>({
    workflows: [],
    templates: [],
  });

  const fetchTemplates = useCallback(async () => {
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
      const response = await getAllUserRuns(user.id, token, sessionId);

      if (!response.status) {
        throw new Error(response.message || "Failed to fetch runs");
      }
      console.log(response.data);
      setRuns(response.data);
    } catch (err) {
      console.error("Error fetching runs:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch runs"));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, token, sessionId, isUserLoaded, isTokenLoading]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { runs, isLoading, error, setRuns };
}
