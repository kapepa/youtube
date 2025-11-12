"use client"

import { FilterCarousel } from "@/components/filter-carousel";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { FC, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CategoriesSectionProps {
  categoryId?: string
}

const CategoriesSection: FC<CategoriesSectionProps> = (props) => {
  const { categoryId } = props;

  return (
    <Suspense
      fallback={<CategoriesSectionSkeleton />}
    >
      <ErrorBoundary
        fallback={<div>Something went wrong.</div>}
      >
        <CategoriesSectionSuspense
          categoryId={categoryId}
        />
      </ErrorBoundary>
    </Suspense>
  )
}

const CategoriesSectionSkeleton = () => {
  return <FilterCarousel isLoading data={[]} onSelect={() => { }} />
}

const CategoriesSectionSuspense: FC<CategoriesSectionProps> = (props) => {
  const { categoryId } = props;
  const router = useRouter();
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const data = categories.map(({ id, name }) => ({ value: id, label: name }))

  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href);

    if (value) {
      url.searchParams.set("categoryId", value);
    } else {
      url.searchParams.delete("categoryId");
    }

    router.push(url.toString())
  }

  return (
    <FilterCarousel
      data={data}
      value={categoryId}
      onSelect={onSelect}
    />
  )
}

export { CategoriesSection, CategoriesSectionSuspense }