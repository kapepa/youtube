"use client"

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ROUTERS } from "@/lib/routers";
import { NavItemInt } from "@/lib/types/nav-item";
import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { FC } from "react";
import { usePathname } from "next/navigation";

const items: NavItemInt[] = [
  {
    url: ROUTERS.PLAYLISTS_HISTORY,
    icon: HistoryIcon,
    title: "History",
    auth: true,
  },
  {
    url: ROUTERS.PLAYLISTS_LIKED,
    icon: ThumbsUpIcon,
    title: "Liked video",
    auth: true,
  },
  {
    url: ROUTERS.PLAYLISTS,
    icon: ListVideoIcon,
    title: "All playlists",
    auth: true,
  },
]

const PersoneSection: FC = () => {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        You
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {
            items.map((item) => (
              <SidebarMenuItem
                key={item.title}
              >
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={pathname === item.url}
                  onClick={(e) => {
                    if (!isSignedIn && item.auth) {
                      e.preventDefault();
                      return clerk.openSignIn();
                    }
                  }}
                >
                  <Link
                    href={item.url}
                    className="flex items-center gap-4"
                  >
                    <item.icon />
                    <span
                      className="text-sm"
                    >
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          }
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export { PersoneSection }