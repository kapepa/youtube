"use client"

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ROUTERS } from "@/lib/routers";
import { SectionPersonInt } from "@/lib/types/section-item";
import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { FC } from "react";

const items: SectionPersonInt[] = [
  {
    url: ROUTERS.PLAYLIST_HISTORY,
    icon: HistoryIcon,
    title: "History",
    auth: true,
  },
  {
    url: ROUTERS.PLAYLIST_LIKED,
    icon: ThumbsUpIcon,
    title: "Liked video",
    auth: true,
  },
  {
    url: ROUTERS.PLAYLIST,
    icon: ListVideoIcon,
    title: "All playlists",
    auth: true,
  },
]

const PersoneSection: FC = () => {
  const clerk = useClerk();
  const { isSignedIn } = useAuth()

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
                  isActive={false}
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