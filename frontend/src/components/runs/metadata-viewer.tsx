import { format } from "date-fns";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ExternalLink } from "lucide-react";

export const MetadataViewer = ({ item }: { item: any }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!item) return <div>No data available</div>;

  const metadata = item.metadata || {};
  if (item.url) metadata.url = item.url;
  if (item.model) metadata.model = item.model;
  if (item.system) metadata.system = item.system;

  const hasScraperResult = !!metadata.scraper_result;
  const hasLlmResult = !!metadata.llmmodel_result;
  const hasGoogleDocsResult = !!metadata.google_docs_result;

  // Format timestamp to a readable format
  const formatDate = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy h:mm a");
    } catch (error) {
      return timestamp;
    }
  };

  return (
    <ScrollArea className="h-[calc(90vh-10rem)]">
      <div className="p-1">
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {hasScraperResult && (
              <TabsTrigger value="scraper">Scraper Result</TabsTrigger>
            )}
            {hasLlmResult && <TabsTrigger value="llm">LLM Result</TabsTrigger>}
            {hasGoogleDocsResult && (
              <TabsTrigger value="docs">Google Docs</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(metadata)
                .filter(
                  ([key]) =>
                    ![
                      "scraper_result",
                      "llmmodel_result",
                      "google_docs_result",
                    ].includes(key)
                )
                .map(([key, value]) => (
                  <div key={key} className="border rounded-md p-3">
                    <div className="font-medium text-sm text-muted-foreground mb-1">
                      {key}
                    </div>
                    {typeof value === "string" ? (
                      key.toLowerCase().includes("url") ? (
                        <div className="flex items-center">
                          <a
                            href={value as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline break-all flex-1"
                          >
                            {value as string}
                          </a>
                          <ExternalLink className="h-4 w-4 ml-1 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="break-all">{value as string}</div>
                      )
                    ) : value === null || value === undefined ? (
                      <div className="text-muted-foreground italic">None</div>
                    ) : typeof value === "object" &&
                      Object.keys(value).length === 0 ? (
                      <div className="text-muted-foreground italic">
                        Empty object
                      </div>
                    ) : (
                      <div className="text-sm font-mono bg-muted p-2 rounded overflow-auto max-h-20">
                        {JSON.stringify(value, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </TabsContent>

          {hasScraperResult && (
            <TabsContent value="scraper" className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="font-medium text-sm text-muted-foreground mb-1">
                      URL
                    </div>
                    <div className="flex items-center">
                      <a
                        href={metadata.scraper_result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline break-all flex-1"
                      >
                        {metadata.scraper_result.url}
                      </a>
                      <ExternalLink className="h-4 w-4 ml-1 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-muted-foreground mb-1">
                      Scraped At
                    </div>
                    <div>{formatDate(metadata.scraper_result.scrapedAt)}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="font-medium text-sm text-muted-foreground mb-1">
                    Title
                  </div>
                  <div className="text-lg font-semibold">
                    {metadata.scraper_result.title}
                  </div>
                </div>

                <div>
                  <div className="font-medium text-sm text-muted-foreground mb-1">
                    Content
                  </div>
                  <ScrollArea className="h-80 w-full">
                    <div className="bg-muted p-3 rounded-md whitespace-pre-wrap text-sm">
                      {metadata.scraper_result.content}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          )}

          {hasLlmResult && (
            <TabsContent value="llm" className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="font-medium text-sm text-muted-foreground mb-1">
                      Model
                    </div>
                    <div>{metadata.llmmodel_result.model}</div>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-muted-foreground mb-1">
                      Processed At
                    </div>
                    <div>
                      {formatDate(metadata.llmmodel_result.processedAt)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-medium text-sm text-muted-foreground mb-1">
                    Result
                  </div>
                  <ScrollArea className="h-80 w-full">
                    <div className="bg-muted p-3 rounded-md whitespace-pre-wrap text-sm">
                      {metadata.llmmodel_result.result}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          )}

          {hasGoogleDocsResult && (
            <TabsContent value="docs" className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="font-medium text-sm text-muted-foreground mb-1">
                      Title
                    </div>
                    <div className="font-semibold">
                      {metadata.google_docs_result.title}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-muted-foreground mb-1">
                      Updated At
                    </div>
                    <div>
                      {formatDate(metadata.google_docs_result.updatedAt)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium text-sm text-muted-foreground mb-1">
                      Document ID
                    </div>
                    <div className="font-mono text-xs break-all">
                      {metadata.google_docs_result.documentId}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-muted-foreground mb-1">
                      Document URL
                    </div>
                    <div className="flex items-center">
                      <a
                        href={metadata.google_docs_result.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline break-all flex-1 text-sm"
                      >
                        Open Document
                      </a>
                      <ExternalLink className="h-4 w-4 ml-1 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </ScrollArea>
  );
};
