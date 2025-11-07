"use client"

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ROUTERS } from "@/lib/routers";
import { SectionItemInt } from "@/lib/types/section-item";
import { FlameIcon, HomeIcon, PlaySquareIcon } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

const items: SectionItemInt[] = [
  {
    url: ROUTERS.HOME,
    icon: HomeIcon,
    title: "Home",
  },
  {
    url: ROUTERS.FEED_SUBSCRIPTIONS,
    icon: PlaySquareIcon,
    title: "Subscriptions",
    auth: true,
  },
  {
    url: ROUTERS.FEED_TRENDING,
    icon: FlameIcon,
    title: "Trending",
  },
]

const MainSection: FC = () => {

  return (
    <SidebarGroup>
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
                  onClick={() => { }}
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

export { MainSection }