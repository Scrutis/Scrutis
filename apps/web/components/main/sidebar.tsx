'use client'
import * as React from "react"

import {
  BarChart3,
  Settings,
  Bell,
  HelpCircle,
  ShieldCheck,
  Link2,
  FileCode,
  KeyRound,
} from "lucide-react";
import { NavUser } from "./nav-user";
import { authClient } from "@/lib/auth-client";
import { CreateProject } from "./create-project";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@scrutis/ui/components/sidebar";
import { LogoIcon } from "../landing/logo";

const data = {
  navMain: [
    {
      title: "Overview",
      url: "#",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "File Scan",
      url: "#",
      icon: ShieldCheck,
    },
    {
      title: "Url Scan",
      url: "#",
      icon: Link2,
    },
    {
      title: "Reports",
      url: "#",
      icon: FileCode,
    },
  ],
  support: [
    {
      title: "API Keys",
      url: "#",
      icon: KeyRound,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Help Center",
      url: "#",
      icon: HelpCircle,
    },
    {
      title: "Notifications",
      url: "#",
      icon: Bell,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    data: session,
  } = authClient.useSession(); 

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex h-14 shrink-0 items-center border-b px-4">
          <LogoIcon className="w-50 h-50" />
          <span className="text-2xl text-center font-bold dark:text-white">
            Scrutis
          </span>
        </div>
        <CreateProject />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        <SidebarGroup key="Main">
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive}>
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
        <SidebarGroup key="suppport">
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.support.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
      <SidebarFooter>
        <NavUser
          name={session?.user.name as string}
          email={session?.user.email as string}
          avatar={session?.user.image as string}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
