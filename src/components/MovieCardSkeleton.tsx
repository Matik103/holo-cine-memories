import { Skeleton } from "./ui/skeleton";

export const MovieCardSkeleton = () => (
  <div className="neural-card rounded-2xl overflow-hidden">
    <div className="flex flex-col md:flex-row">
      <Skeleton className="w-full md:w-1/3 aspect-[3/4] md:aspect-[2/3]" />
      <div className="w-full md:w-2/3 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-3 pt-3 sm:pt-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  </div>
);
