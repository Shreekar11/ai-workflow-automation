"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserButton, useUser } from "@clerk/nextjs";
import { Home, LayoutTemplate, RotateCw } from "lucide-react";
import { usePathname } from "next/navigation";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/workflows",
    icon: Home,
  },
  {
    title: "Templates",
    url: "/templates",
    icon: LayoutTemplate,
  },
  {
    title: "Previous Runs",
    url: "/runs",
    icon: RotateCw,
  },
];

export function AppSidebar() {
  const { user, isLoaded } = useUser();
  const pathName = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="text-2xl font-bold text-gray-900 py-4 border-b">
        Dashboard
      </SidebarHeader>
      <SidebarContent className="mt-10">
        <SidebarGroup>
          <div className="text-sm py-4">MAIN MENU</div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`py-5 ${
                      pathName === item.url &&
                      "hover:bg-[#FF7801]/10 bg-[#FF7801]/10 text-gray-900"
                    }`}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {isLoaded && (
        <SidebarFooter className="border-t border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserButton />

              <div>
                <p className="text-sm font-medium">{`${user?.firstName} ${user?.lastName}`}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.emailAddresses[0].emailAddress}
                </p>
              </div>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
