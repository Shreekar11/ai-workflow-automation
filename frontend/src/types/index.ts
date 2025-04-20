import { ReactNode } from "react";

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
  workflow: {
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
        image: string;
      };
    }[];
    trigger: {
      metadata: any;
      type: {
        id: string;
        name: string;
      };
    };
    workflowRuns: {
      metadata: any;
      status: string;
    }[];
  };
  webhookKey: {
    id: string;
    timestamp: Date;
    triggerId: string;
    secretKey: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface ValidationRules {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  custom?: (value: string) => boolean;
}

export interface TriggerType {
  id: string;
  name: string;
  metadata: Record<string, string>;
}
export interface ActionType {
  id: string;
  name: string;
  metadata: Record<string, string>;
  triggerMetadata?: Record<string, string>;
}

export interface RunType {
  workflows: {
    id?: string;
    triggerId: string;
    userId: string;
    name: string;
    timestamp: string;
    workflowRuns: {
      id: string;
      status: string;
      metadata: any;
      timestamp: string;
    }[];
  }[];
  templates: {
    id: string;
    userId: string;
    name: string;
    preTemplateId: string;
    templateResults: {
      id: string;
      status: string;
      metadata: any;
      timestamp: string;
    }[];
  }[];
}
export interface Template {
  id?: string;
  name: string;
  userId: number;
  preTemplate: PreTemplateType;
  templateResults: {
    id?: string;
    templateId: string;
    metadata: any;
    status: string;
    timestamp: string;
  }[];
}

export interface PreTemplateType {
  id?: string;
  name: string;
  description: string;
  template: {
    id: string;
    name: string;
    templateResults: any[];
  };
  availableTemplateActions: TemplateAction[];
}

export interface TemplateAction {
  id: string;
  preTemplateId: string;
  name: string;
  image: string;
  actions: {
    id: string;
    templateId: string;
    actionId: string;
    metadata: any;
  }[];
}

export interface TemplatePayload {
  id?: string;
  preTemplateId?: string;
  name: string;
  actions: Array<{
    availableActionId: string;
    actionMetadata?: any;
  }>;
}

// Define the request payload structure for running the template
export interface RunTemplatePayload {
  metadata: {
    url: string;
    model: string;
    system: string;
    googleDocsId: string;
  };
}
