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

export interface OptionType {
  id: string;
  name: string;
  image?: string;
  type?: string;
  icon?: ReactNode;
  metadata?: Record<string, string>;
}

export interface NodeCardProps {
  workflow: Workflow | null;
  selectTrigger: {
    id: string;
    name: string;
    metadata: Record<string, string>;
  };
  setSelectTrigger: React.Dispatch<
    React.SetStateAction<{
      id: string;
      name: string;
      metadata: Record<string, string>;
    }>
  >;
  finalTrigger: {
    id: string;
    name: string;
    metadata: Record<string, string>;
  };
  setFinalTrigger: React.Dispatch<
    React.SetStateAction<{
      id: string;
      name: string;
      metadata: Record<string, string>;
    }>
  >;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: {
    id: string;
    type: string;
    name: string;
    metadata: Record<string, string>;
    data: Record<string, string>;
  }) => void;
  type: "trigger" | "action";
}

export interface MetadataDisplayProps {
  type: string;
  metadata: Record<string, string>;
}

export interface TriggerMetadataFieldsProps {
  metadata: Record<string, string>;
  errors: Record<string, boolean>;
  setMetadata: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  handleMetadataChange: (key: string, value: string) => void;
}

export interface ActionMetadataFieldsProps {
  selectedOption: OptionType;
  metadata: Record<string, string>;
  errors: Record<string, boolean>;
  errorMessages: Record<string, string>;
  selectTrigger: {
    metadata: Record<string, string>;
  };
  setDisplayTrigger: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  setSelectTrigger: React.Dispatch<
    React.SetStateAction<{
      id: string;
      name: string;
      metadata: Record<string, string>;
    }>
  >;
  finalTrigger: {
    id: string;
    name: string;
    metadata: Record<string, string>;
  };
  setFinalTrigger: React.Dispatch<
    React.SetStateAction<{
      id: string;
      name: string;
      metadata: Record<string, string>;
    }>
  >;
  handleMetadataChange: (
    key: string,
    value: string,
    callback?: (key: string, value: string) => void
  ) => void;
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

export interface PreTemplateType {
  id?: string;
  name: string;
  description: string;
  template: {
    id: string;
    name: string;
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
