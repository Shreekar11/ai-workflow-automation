import { useEffect, useState } from "react";
import { getAvailableTriggerActions } from "../actions/workflow.action";

export const useAvailableTriggersActions = (type: string) => {
  const [loading, setLoading] = useState(true);
  const [availableTriggerActions, setAvailableTriggerActions] = useState<
    {
      id: string;
      name: string;
      image: string;
    }[]
  >([]);

  useEffect(() => {
    if (type) {
      fetchAvailableTriggerActions();
    }
  }, [type]);

  const fetchAvailableTriggerActions = async () => {
    try {
      const response = await getAvailableTriggerActions(type);
      if (!response.status) {
        throw new Error(
          response.message || "Error fetching trigger and actions"
        );
      }
      const data = response.data;
      setAvailableTriggerActions(data);
    } catch (err: any) {
      console.error("Error: ", err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, availableTriggerActions };
};
