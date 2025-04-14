import { useToken } from "./useToken";
import { useUser } from "@clerk/nextjs";
import { PreTemplateType } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { getTemplateById } from "../actions/template.action";

interface UseTemplatesReturn {
  template: PreTemplateType;
  isLoading: boolean;
  error: Error | null;
  setTemplate: React.Dispatch<React.SetStateAction<PreTemplateType>>;
}

export function useTemplate(templateId: string | string[]): UseTemplatesReturn {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isLoading: isTokenLoading, token, sessionId } = useToken();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [template, setTemplate] = useState<PreTemplateType>({
    name: "",
    description: "",
    template: {
      id: "",
      name: "",
    },
    availableTemplateActions: [],
  });

  const fetchTemplate = useCallback(async () => {
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
      const response = await getTemplateById(
        user.id,
        token,
        sessionId,
        templateId
      );

      if (!response.status) {
        throw new Error(response.message || "Failed to fetch templates");
      }

      setTemplate(response.data);
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
    fetchTemplate();
  }, [fetchTemplate]);

  return { template, isLoading, error, setTemplate };
}
