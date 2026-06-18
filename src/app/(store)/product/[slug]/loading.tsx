// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        {/* Left — image gallery skeleton */}
        <div className="flex flex-col gap-3">
          {/* Main large image */}
          <Skeleton className="aspect-square w-full rounded-xl" />
          {/* 4 small thumbnails */}
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-16 h-16 flex-shrink-0 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Right — product info skeleton */}
        <div className="flex flex-col gap-5">
          {/* Brand */}
          <Skeleton className="h-3 w-24" />
          {/* Title */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-4/5 rounded-lg" />
          </div>
          {/* Price */}
          <div className="flex items-baseline gap-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          {/* Stock badge */}
          <Skeleton className="h-7 w-28 rounded-full" />
          {/* Size selector */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-16" />
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-11 rounded-lg" />
              ))}
            </div>
          </div>
          {/* Add to cart + wishlist */}
          <div className="flex gap-3">
            <Skeleton className="flex-1 h-14 rounded-xl" />
            <Skeleton className="w-14 h-14 rounded-xl" />
          </div>
          {/* Description */}
          <div className="space-y-2 pt-3 border-t border-brand-border">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}
