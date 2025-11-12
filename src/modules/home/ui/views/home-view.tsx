import { FC, Suspense } from "react";
import { CategoriesSection, CategoriesSectionSuspense } from "../sections/categories-section";
import { ErrorBoundary } from "react-error-boundary";

interface HomeViewProps {
  categoryId?: string
}

const HomeView: FC<HomeViewProps> = (props) => {
  const { categoryId } = props;

  return (
    <div
      className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6"
    >
      <Suspense
        fallback={<p>Loading...</p>}
      >
        <ErrorBoundary
          fallback={<div>Something went wrong.</div>}
        >
          <CategoriesSection
            categoryId={categoryId}
          />
        </ErrorBoundary>
      </Suspense>
    </div>
  )
}

export { HomeView }