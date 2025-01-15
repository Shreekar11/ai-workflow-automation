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

export interface Workflow {
  id: string;
  triggerId: string;
  userId: number;
  name: string;
  timestamp: string;
  actions: {
    id: string;
    metadata: any;
    type: {
      id: string;
      name: string;
    };
  }[];
  trigger: {
    metadata: any;
    type: {
      id: string;
      name: string;
    };
  };
}
