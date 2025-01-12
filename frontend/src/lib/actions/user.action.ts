import { api } from "@/app/api/client";
import { ApiResponse, UserDetailsType } from "@/types";

export const createUserAction = async (userData: UserDetailsType) => {
  try {
    const response = await api.post<ApiResponse<UserDetailsType>>(
      "/api/v1/user",
      userData
    );

    const data = response.data;
    if (!data.status) {
      throw new Error(JSON.stringify(data));
    }
    return data;
  } catch (error: unknown) {
    let errorMessage: string;

    if (error instanceof Error) {
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError.error || "An unknown error occurred.";
      } catch {
        errorMessage = error.message;
      }
    } else {
      errorMessage = "An unexpected error occurred.";
    }

    return {
      status: false,
      message: errorMessage,
    };
  }
};
