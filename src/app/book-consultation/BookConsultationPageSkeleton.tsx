import { Skeleton } from "@/components/ui/skeleton";

function FormSectionSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <section className="booking-shadow rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="size-6 shrink-0 rounded-md" />
        <Skeleton className="h-7 w-48 max-w-[70%]" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className={i === fields - 1 && fields % 2 !== 0 ? "md:col-span-2" : undefined}>
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </section>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="space-y-6 lg:col-span-4">
      <div className="overflow-hidden rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest">
        <Skeleton className="h-64 w-full rounded-none" />
        <div className="space-y-4 p-6 sm:p-8">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-52 w-full rounded-xl" />
    </aside>
  );
}

export function BookConsultationPageSkeleton() {
  return (
    <div
      className="w-full bg-lp-surface px-5 py-12 sm:px-8 sm:py-16 lg:px-16"
      aria-busy="true"
      aria-label="Loading booking page"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl space-y-3">
          <Skeleton className="h-12 w-full max-w-lg sm:h-14" />
          <Skeleton className="h-5 w-full max-w-md" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-6">
          <div className="space-y-6 lg:col-span-8">
            <FormSectionSkeleton fields={5} />
            <FormSectionSkeleton fields={4} />
            <section className="booking-shadow rounded-xl border border-lp-outline-variant/30 bg-lp-surface-container-lowest p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <Skeleton className="size-6 shrink-0 rounded-md" />
                <Skeleton className="h-7 w-56 max-w-[80%]" />
              </div>
              <Skeleton className="mb-2 h-3 w-32" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </section>
            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-12 w-full rounded-xl sm:w-56" />
            </div>
          </div>
          <SidebarSkeleton />
        </div>
      </div>
    </div>
  );
}
