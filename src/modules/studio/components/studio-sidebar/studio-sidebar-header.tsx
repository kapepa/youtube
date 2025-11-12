import { SidebarHeader, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { ROUTERS } from "@/lib/routers";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { FC } from "react";

const StudioSidebarHeader: FC = () => {
  const { user } = useUser();
  const { state } = useSidebar();

  if (!user) return (
    <SidebarHeader
      className="flex items-center justify-center pb-4"
    >
      <Skeleton
        className="size-28 rounded-full"
      />
      <div
        className="flex flex-col items-center mt-2 gap-y-1.5"
      >
        <Skeleton
          className="h-4 w-20"
        />
        <Skeleton
          className="h-4 w-24"
        />
      </div>
    </SidebarHeader>
  );

  if (state === "collapsed") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          tooltip="Your profile"
        >
          <Link
            href={ROUTERS.USER_CURRENT}
          >
            <UserAvatar
              size="xs"
              name={user?.fullName ?? "User"}
              imageUrl={user?.imageUrl}
            />
            <span
              className="text-sm"
            >
              Your profile
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarHeader
      className="flex items-center justify-center pb-4"
    >
      <Link
        href={ROUTERS.USER_CURRENT}
      >
        <UserAvatar
          name={user?.fullName ?? "User"}
          imageUrl={user?.imageUrl}
          className="size-28 hover:opacity-80 transition-opacity"
        />
      </Link>
      <div
        className="flex flex-col items-center mt-2 gap-y-1.5"
      >
        <p
          className="text-sm font-medium"
        >
          Your profile
        </p>
        <p
          className="text-xs text-muted-foreground"
        >
          {user.fullName}
        </p>
      </div>
    </SidebarHeader>
  )
}

export { StudioSidebarHeader }