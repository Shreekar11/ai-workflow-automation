import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { CheckCircle, RefreshCw, XCircle } from "lucide-react";

interface TemplateTableProps {
  filteredTemplates: {
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
  onViewDetails: (value: any) => void;
}

export const TemplateTable = ({
  filteredTemplates,
  onViewDetails,
}: TemplateTableProps) => {
  const formatDate = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy h:mm a");
    } catch (error) {
      return timestamp;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </Badge>
        );
      case "running":
      case "in_progress":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Running
          </Badge>
        );
      case "failed":
      case "error":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="w-3 h-3 mr-1" /> Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatMetadataSummary = (item: any) => {
    if (!item) return "N/A";

    if (item.url) {
      return `URL: ${item.url.substring(0, 30)}...`;
    } else if (item.model) {
      return `Model: ${item.model}`;
    }

    const metadata = item?.metadata || {};
    if (Object.keys(metadata).length === 0) return "No metadata";

    if (metadata?.url) {
      return `URL: ${metadata?.url.substring(0, 30)}...`;
    } else if (metadata?.model) {
      return `Model: ${metadata?.model}`;
    } else if (metadata?.googleDocsId) {
      return `Google Doc: ${metadata?.googleDocsId.substring(0, 15)}...`;
    }

    return "Click to view details";
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Template</TableHead>
          <TableHead>Result ID</TableHead>
          <TableHead>Timestamp</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Details</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredTemplates
          .flatMap((template) =>
            template.templateResults.map((result) => ({
              templateName: template.name,
              templateId: template.id,
              ...result,
            }))
          )
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .slice(0, 5)
          .map((result) => (
            <TableRow key={result.id}>
              <TableCell>{result.templateName}</TableCell>
              <TableCell className="font-mono text-xs">{result.id}</TableCell>
              <TableCell>{formatDate(result.timestamp)}</TableCell>
              <TableCell>{getStatusBadge(result.status)}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {formatMetadataSummary(result)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(result)}
                  disabled={
                    (!result.metadata ||
                      Object.keys(result.metadata).length === 0) &&
                    !result.metadata?.url &&
                    !result.metadata?.model
                  }
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};
