import { Skeleton } from "@/components/ui/skeleton"; // Adjust path based on your setup

export default function TemplateSkeleton () {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header Section Skeleton */}
      <div className="flex flex-col space-y-4 mb-8">
        <Skeleton className="h-9 w-64" /> {/* Title */}
        <Skeleton className="h-5 w-[32rem]" /> {/* Description */}
        <div className="relative max-w-md">
          <Skeleton className="h-10 w-full" /> {/* Search */}
        </div>
      </div>

      {/* Template Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="border rounded-lg p-4 flex flex-col space-y-3"
          >
            <Skeleton className="h-6 w-48" /> {/* Card title */}
            <Skeleton className="h-4 w-full" /> {/* Description */}
            <Skeleton className="h-4 w-3/4" /> {/* Description */}
            <Skeleton className="h-10 w-32 mt-auto" /> {/* Button */}
          </div>
        ))}
      </div>

      {/* Custom Workflow Section Skeleton */}
      <div className="mt-12 bg-muted rounded-lg p-6">
        <Skeleton className="h-7 w-56 mb-2" /> {/* Title */}
        <Skeleton className="h-5 w-[28rem] mb-4" /> {/* Description */}
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-48" /> {/* Button 1 */}
        </div>
      </div>
    </div>
  );
};
