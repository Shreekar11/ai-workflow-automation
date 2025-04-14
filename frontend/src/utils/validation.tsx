export const validateRunFlow = (
  templateName: string,
  nodes: any[],
  nodeFormData: any
): boolean => {
  if (!validateFlow(templateName, nodes)) return false;

  // Check for required fields in each node type
  for (const node of nodes) {
    const nodeData = nodeFormData[node.id];

    if (!nodeData) continue;

    if (node.type === "blogScraper" && !nodeData.url) {
      return false;
    }

    if (node.type === "llmModel" && (!nodeData.model || !nodeData.system)) {
      return false;
    }

    if (node.type === "googleDocs" && !nodeData.googleDocsId) {
      return false;
    }
  }

  return true;
};

// Validate the flow before saving or running
export const validateFlow = (templateName: string, nodes: any[]): boolean => {
  // Check if we have a workflow name
  if (!templateName || templateName.trim() === "") {
    return false;
  }

  // Check if we have at least one node
  if (nodes.length === 0) {
    return false;
  }

  return true;
};
