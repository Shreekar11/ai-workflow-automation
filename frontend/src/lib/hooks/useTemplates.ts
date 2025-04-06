import { useToken } from "./useToken";
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { getAllTemplates } from "../actions/template.action";
import { PreTemplateType } from "@/types";

interface UseTemplatesReturn {
  templates: PreTemplateType[];
  isLoading: boolean;
  error: Error | null;
  setTemplates: React.Dispatch<React.SetStateAction<PreTemplateType[]>>;
}

export function useTemplates(): UseTemplatesReturn {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isLoading: isTokenLoading, token, sessionId } = useToken();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [templates, setTemplates] = useState<PreTemplateType[]>([]);

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
      const response = await getAllTemplates(user.id, token, sessionId);

      if (!response.status) {
        throw new Error(response.message || "Failed to fetch templates");
      }

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid template data received");
      }

      setTemplates(response.data);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch templates")
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, token, sessionId, isUserLoaded, isTokenLoading]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { templates, isLoading, error, setTemplates };
}
