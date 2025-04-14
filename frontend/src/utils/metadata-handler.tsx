import { RunTemplatePayload, TemplatePayload } from "@/types";

export // Build template payload from nodes data
const buildTemplatePayload = (
  template: any,
  templateName: string,
  nodes: any[],
  nodeFormData: any
): TemplatePayload => {
  const actions = nodes.map((node) => {
    const nodeData = nodeFormData[node.id];
    let actionMetadata = {};

    if (node.type === "blogScraper" && nodeData?.url) {
      actionMetadata = { url: nodeData.url };
    } else if (node.type === "llmModel") {
      actionMetadata = {
        model: nodeData?.model || "",
        system: nodeData?.system || "",
      };
    } else if (node.type === "googleDocs" && nodeData?.googleDocsId) {
      actionMetadata = { googleDocsId: nodeData.googleDocsId };
    }

    return {
      availableActionId: nodeData?.availableActionId || node.id,
      actionMetadata,
    };
  });

  return {
    preTemplateId: template?.id,
    name: templateName,
    actions,
  };
};

export const buildRunRequestPayload = (
  nodes: any[],
  nodeFormData: any
): RunTemplatePayload | null => {
  let url = "";
  let model = "";
  let system = "";
  let googleDocsId = "";

  // Find the data from each type of node
  nodes.forEach((node) => {
    const nodeData = nodeFormData[node.id];
    if (!nodeData) return;

    if (node.type === "blogScraper" && nodeData.url) {
      url = nodeData.url;
    }

    if (node.type === "llmModel") {
      model = nodeData.model || "";
      system = nodeData.system || "";
    }

    if (node.type === "googleDocs" && nodeData.googleDocsId) {
      googleDocsId = nodeData.googleDocsId;
    }
  });

  // Check if we have all required fields
  if (!url || !model || !system || !googleDocsId) {
    return null;
  }

  return {
    metadata: {
      url,
      model,
      system,
      googleDocsId,
    },
  };
};
