import { api } from "@/app/api/client";
import { ApiResponse, UserDetailsType } from "@/types";
import { isAxiosError } from "axios";

export const createUserAction = async (userData: UserDetailsType) => {
  try {
    const response = await api.post("/api/v1/user", userData);

    const data = response.data;
    if (!data.status) {
      throw new Error("Error saving user");
    }
    return data;
  } catch (error: any) {
    if (error instanceof Error) {
      console.error("Error saving user: ", error);
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
