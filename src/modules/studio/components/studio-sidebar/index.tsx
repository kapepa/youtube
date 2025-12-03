"use client"

import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { FC } from "react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ROUTERS } from "@/lib/routers";
import { LogOutIcon, VideoIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { StudioSidebarHeader } from "./studio-sidebar-header";

const StudioSidebar: FC = () => {
  const pathname = usePathname();

  return (
    <Sidebar
      className="pt-16 z-40"
      collapsible="icon"
    >
      <SidebarContent
        className="bg-background"
      >
        <SidebarGroup>
          <SidebarMenu>

            <StudioSidebarHeader />

            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Exit studio"
                asChild
                isActive={pathname === ROUTERS.STUDIO}
              >
                <Link
                  href={ROUTERS.STUDIO}
                  className="hidden md:block"
                >
                  <VideoIcon
                    className="size-5"
                  />
                  <span
                    className="text-sm"
                  >
                    Content
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <Separator />

            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Exit studio"
                asChild
              >
                <Link
                  href={ROUTERS.HOME}
                >
                  <LogOutIcon
                    className="size-5"
                  />
                  <span
                    className="text-sm"
                  >
                    Exist studio
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export { StudioSidebar }