import React from "react";

const PublishTemplatePage = () => {
    // const [isRunning, setIsRunning] = useState<boolean>(false);
  // Extract data from nodes to build run request payload
  //   const buildRunRequestPayload = (): RunTemplatePayload | null => {
  //     let url = "";
  //     let model = "";
  //     let system = "";
  //     let googleDocsId = "";

  //     // Find the data from each type of node
  //     nodes.forEach((node) => {
  //       const nodeData = nodeFormData[node.id];
  //       if (!nodeData) return;

  //       if (node.type === "blogScraper" && nodeData.url) {
  //         url = nodeData.url;
  //       }

  //       if (node.type === "llmModel") {
  //         model = nodeData.model || "";
  //         system = nodeData.system || "";
  //       }

  //       if (node.type === "googleDocs" && nodeData.googleDocsId) {
  //         googleDocsId = nodeData.googleDocsId;
  //       }
  //     });

  //     // Check if we have all required fields
  //     if (!url || !model || !system || !googleDocsId) {
  //       return null;
  //     }

  //     return {
  //       metadata: {
  //         url,
  //         model,
  //         system,
  //         googleDocsId,
  //       },
  //     };
  //   };

  // Validate run-specific requirements
  //   const validateRunFlow = (): boolean => {
  //     if (!validateFlow()) return false;

  //     // Check for required fields in each node type
  //     for (const node of nodes) {
  //       const nodeData = nodeFormData[node.id];

  //       if (!nodeData) continue;

  //       if (node.type === "blogScraper" && !nodeData.url) {
  //         toast({
  //           title: "Validation Error",
  //           description: `Blog Scraper node requires a URL`,
  //           variant: "destructive",
  //         });
  //         return false;
  //       }

  //       if (node.type === "llmModel" && (!nodeData.model || !nodeData.system)) {
  //         toast({
  //           title: "Validation Error",
  //           description: `LLM Model node requires both a model selection and system prompt`,
  //           variant: "destructive",
  //         });
  //         return false;
  //       }

  //       if (node.type === "googleDocs" && !nodeData.googleDocsId) {
  //         toast({
  //           title: "Validation Error",
  //           description: `Google Docs node requires a document ID`,
  //           variant: "destructive",
  //         });
  //         return false;
  //       }
  //     }

  //     return true;
  //   };

  return (
    <div>
      {/* <Button
        variant="outline"
        disabled={isRunning || !isSaved}
        onClick={handleRunTemplate}
        className={`
                bg-[#FF7801] text-white
                hover:bg-[#FF7801]/80 hover:text-white
                ${!isSaved ? "opacity-60 cursor-not-allowed" : ""}
              `}
      >
        {isRunning ? "Running..." : "Run Template"}
      </Button> */}
    </div>
  );
};

export default PublishTemplatePage;
