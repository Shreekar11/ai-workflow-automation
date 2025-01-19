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
  selectTrigger: {
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
  handleMetadataChange: (key: string, value: string) => void;
}
