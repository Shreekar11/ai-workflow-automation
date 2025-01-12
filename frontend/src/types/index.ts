export interface UserDetailsType {
    clerkUserId: string;
    email: string;
    firstName: string | undefined;
    lastName: string | undefined;
  }

  export interface ApiResponse<T> {
    status: boolean;
    message: string;
    data?: T;
    error?: string;
  }
  