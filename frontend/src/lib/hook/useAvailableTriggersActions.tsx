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

  const fetchAvailableTriggerActions = async () => {
    try {
      const response = await getAvailableTriggerActions(type);
      if (!response.status) {
        throw new Error("Error fetching trigger and actions");
      }
      const data = response.data;
      setAvailableTriggerActions(data);
    } catch (err: any) {
      console.log("Errro: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableTriggerActions();
  }, [type]);

  return { loading, availableTriggerActions };
};
