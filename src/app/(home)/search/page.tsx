import { DEFAULT_LIMIT } from "@/constants";
import { SearchView } from "@/modules/search/ui/views/search-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { NextPage } from "next";

export const dynamic = "force-dynamic"

interface SearchPageProps {
  searchParams: Promise<{ // Fixed: searchParamas -> searchParams
    query: string | undefined,
    categoryId: string | undefined,
  }>
}

const SearchPage: NextPage<SearchPageProps> = async (props) => {
  const { query, categoryId } = await props.searchParams;

  void trpc.categories.getMany.prefetch();
  void trpc.search.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
    query,
    categoryId,
  });

  return (
    <HydrateClient>
      <SearchView
        query={query}
        categoryId={categoryId}
      />
    </HydrateClient>
  )
}

export default SearchPage;