import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { FC } from "react";
import { MainSection } from "./main-section";
import { Separator } from "@/components/ui/separator";
import { PersoneSection } from "./person-section";
import { SignedIn } from "@clerk/nextjs";
import { SubscriptionsSection } from "./subscriptions-section";

const HomeSidebar: FC = () => {
  return (
    <Sidebar
      className="pt-16 z-40 border-none"
      collapsible="icon"
    >
      <SidebarContent
        className="bg-background"
      >
        <MainSection />
        <Separator />
        <PersoneSection />
        <SignedIn>
          <>
            <Separator />
            <SubscriptionsSection />
          </>
        </SignedIn>
      </SidebarContent>
    </Sidebar>
  )
}

export { HomeSidebar }