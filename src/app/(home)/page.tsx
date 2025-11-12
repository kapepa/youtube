import { HomeView } from "@/modules/home/ui/views/home-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic"

interface HomepPageProps {
  searchParams: Promise<{ categoryId?: string }>
}

export default async function HomepPage({ searchParams }: HomepPageProps) {
  const { categoryId } = await searchParams;
  void trpc.categories.getMany.prefetch();

  return (
    <HydrateClient>
      <HomeView
        categoryId={categoryId}
      />
    </HydrateClient>
  );
};