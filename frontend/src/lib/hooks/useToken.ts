import { useAuth, useSession } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";

interface UseTokenReturn {
  token: string;
  sessionId: string | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export const useToken = (): UseTokenReturn => {
  const { getToken, isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { session, isLoaded: isSessionLoaded } = useSession();
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isAuthLoaded || !isSessionLoaded) {
        return;
      }

      if (!isSignedIn) {
        throw new Error("User is not authenticated");
      }

      if (!session?.status || session.status !== "active") {
        throw new Error("No active session found");
      }

      const clerkToken = await getToken();

      if (!clerkToken) {
        throw new Error("Failed to retrieve authentication token");
      }

      setToken(clerkToken);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch token"));
      setToken("");
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isAuthLoaded, isSessionLoaded, isSignedIn, session?.status]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const refresh = useCallback(async () => {
    await fetchToken();
  }, [fetchToken]);

  return {
    token,
    sessionId: session?.id || null,
    isLoading: isLoading || !isAuthLoaded || !isSessionLoaded,
    error,
    refresh,
  };
};
