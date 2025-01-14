import { api } from "@/app/api/client";
import { isAxiosError } from "axios";

export const publishWorkflow = async (
  selectActions: { id: string; name: string }[],
  selectTrigger: { id: string; name: string },
  workflowName: string,
  userId: string
) => {
  try {
    const response = await api.post(
      "/api/v1/workflow",
      {
        name: workflowName,
        availableTriggerId: selectTrigger.id,
        triggerMetadata: {},
        actions: selectActions.map((action) => ({
          availableActionId: action.id,
          actionMetadata: {},
        })),
      },
      {
        headers: {
          "clerk-user-id": userId,
        },
      }
    );

    const data = response.data;
    if (!data.status) {
      throw new Error("Error creating workflow");
    }
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating workflow: ", error);
    } else {
      console.error("An unexpected error occurred: ", error);
    }

    if (isAxiosError(error)) {
      const errorResponse = error.response?.data;
      return {
        status: false,
        message: errorResponse?.message || "Server communication error",
      };
    }

    return {
      status: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

export const getAllUsersWorkFlow = async (userId: string) => {
  try {
    const response = await api.get("/api/v1/workflow", {
      headers: {
        "clerk-user-id": userId,
      },
    });
    const data = response.data;
    if (!data.status) {
      throw new Error("Error fetching workflow");
    }
    return data;
  } catch (error: any) {
    if (error instanceof Error) {
      console.error("Error fetching workflow: ", error);
    } else {
      console.error("An unexpected error occurred: ", error);
    }

    if (isAxiosError(error)) {
      const errorResponse = error.response?.data;
      return {
        status: false,
        message: errorResponse?.message || "Server communication error",
      };
    }

    return {
      status: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

export const deleteWorkflow = async (id: string, userId: string) => {
  try {
    const response = await api.delete(`/api/v1/workflow/${id}`, {
      headers: {
        "clerk-user-id": userId,
      },
    });

    const data = response.data;
    if (!data.status) {
      throw new Error("Error deleting workflow");
    }
    return data;
  } catch (error: any) {
    if (error instanceof Error) {
      console.error("Error deleting workflow: ", error);
    } else {
      console.error("An unexpected error occurred: ", error);
    }

    if (isAxiosError(error)) {
      const errorResponse = error.response?.data;
      return {
        status: false,
        message: errorResponse?.message || "Server communication error",
      };
    }

    return {
      status: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

export const getAvailableTriggerActions = async (type: string) => {
  try {
    const response = await api.get(`/api/v1/${type}/available`);
    const data = response.data;
    if (!data.status) {
      throw new Error("Error fetching trigger and actions");
    }
    return data;
  } catch (error: any) {
    if (error instanceof Error) {
      console.error("Error fetching trigger and actions: ", error);
    } else {
      console.error("An unexpected error occurred: ", error);
    }

    if (isAxiosError(error)) {
      const errorResponse = error.response?.data;
      return {
        status: false,
        message: errorResponse?.message || "Server communication error",
      };
    }

    return {
      status: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};
