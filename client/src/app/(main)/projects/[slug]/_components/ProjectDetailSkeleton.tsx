import { Skeleton } from '@/components/ui/skeleton';

export function ProjectDetailSkeleton(): React.ReactElement {
  return (
    <div>
      {/* Header skeleton — centered */}
      <div className="max-w-3xl mx-auto text-center space-y-4 pt-4 md:pt-8 mb-8 md:mb-12">
        <Skeleton className="h-6 w-28 mx-auto rounded-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-5 w-2/3 mx-auto" />
        <div className="flex items-center justify-center gap-4 pt-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </div>

      {/* Cover image skeleton */}
      <Skeleton className="w-full aspect-[2/1] md:aspect-[21/9] rounded-xl md:rounded-2xl mb-10 md:mb-14" />

      {/* Body skeleton */}
      <div className="max-w-[680px] mx-auto space-y-5">
        <Skeleton className="h-[18px] w-full" />
        <Skeleton className="h-[18px] w-full" />
        <Skeleton className="h-[18px] w-5/6" />
        <Skeleton className="h-[18px] w-full" />
        <Skeleton className="h-[18px] w-2/3" />
        <div className="pt-4" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="pt-2" />
        <Skeleton className="h-[18px] w-full" />
        <Skeleton className="h-[18px] w-4/5" />
        <Skeleton className="h-[18px] w-full" />
      </div>
    </div>
  );
}
