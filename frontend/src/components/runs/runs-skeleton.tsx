import { Skeleton } from "@/components/ui/skeleton"; // Adjust path based on your setup
import { Table, TableBody, TableCell, TableRow } from "../ui/table";

export default function RunSkeleton() {
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
      <Table>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-6 w-[200px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-36" />
              </TableCell>{" "}
              <TableCell>
                <Skeleton className="h-6 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-16 ml-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
