export interface WorkflowInterface {
  name: string;
  actions: {
    availableActionId: string;
    actionMetadata?: any;
  }[];
  availableTriggerId: string;
  id?: string | undefined;
  triggerMetadata?: any;
}
