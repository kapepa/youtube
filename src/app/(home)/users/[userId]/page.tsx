import { DEFAULT_LIMIT } from "@/constants";
import { UserView } from "@/modules/users/ui/views/user-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { NextPage } from "next";

interface UsersIdPageProps {
  params: Promise<{
    userId: string,
  }>
}

const UsersIdPage: NextPage<UsersIdPageProps> = async (props) => {
  const { userId } = await props.params;
  void trpc.users.getOne.prefetch({ id: userId });
  void trpc.videos.getMany.prefetchInfinite({ userId, limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <UserView
        userId={userId}
      />
    </HydrateClient>
  )
}

export default UsersIdPage;