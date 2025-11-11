"use client";

import {
  BotMessageSquare,
  HatGlasses,
  MessageSquarePlus,
  MessagesSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAssistants } from "@/lib/api";
import { cn } from "@/lib/utils";

import { LoginStatus } from "./login-status";
import { RecentThreads } from "./recent-threads";
import { Tooltip } from "./tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";

export function WorkspaceSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader className="py-0">
        <HeaderBar />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavRecents />
      </SidebarContent>
      <SidebarFooter>
        <LoginStatus />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function NavMain() {
  const pathname = usePathname();
  const { data: assistants } = useAssistants();
  return (
    <SidebarGroup>
      <SidebarMenu>
        {assistants?.[0] && (
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/workspace/threads/new"}
              asChild
            >
              <Link
                className="text-muted-foreground"
                href="/workspace/threads/new"
              >
                <MessageSquarePlus />
                <span>New Thread</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname === "/workspace/threads"}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/threads">
              <MessagesSquare />
              <span>Threads</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname === "/workspace/assistants"}
            asChild
          >
            <Link
              className="text-muted-foreground"
              href="/workspace/assistants"
            >
              <BotMessageSquare />
              <span>Assistants</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavRecents() {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <RecentThreads />
    </SidebarGroup>
  );
}

function HeaderBar() {
  const { open, toggleSidebar } = useSidebar();
  return open ? (
    <div
      key="container"
      className="flex h-16 w-full items-center justify-between gap-2 transition-[width,height] duration-300 ease-out group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 group-data-[collapsible=icon]:justify-center"
    >
      <Logo className="ml-[7px] cursor-pointer" onClick={toggleSidebar} />
      <Tooltip content="Collapse sidebar">
        <SidebarTrigger className="text-l opacity-30 hover:opacity-100" />
      </Tooltip>
    </div>
  ) : (
    <div
      key="container"
      className="group/collapse-button flex size-8 items-center justify-center pb-4 group-has-data-[collapsible=icon]/sidebar-wrapper:pt-6"
    >
      <Logo className="group-hover/collapse-button:hidden" />
      <SidebarTrigger className="text-l hidden w-4 opacity-30 group-hover/collapse-button:block hover:opacity-100" />
    </div>
  );
}

function Logo({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-primary flex items-center gap-2", className)}
      {...props}
    >
      <HatGlasses size={18} />
      <span className="text-l group-data-[collapsible=icon]:hidden">
        LangLens
      </span>
    </div>
  );
}
