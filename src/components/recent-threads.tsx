"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useThreads } from "@/lib/api";
import { pathOfThread, titleOfThread } from "@/lib/thread/utils";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

export function RecentThreads() {
  const pathname = usePathname();
  const { data: threads = [] } = useThreads();
  if (threads.length === 0) {
    return null;
  }
  return (
    <SidebarMenu>
      {threads.map((thread) => {
        const isActive = pathOfThread(thread, false) === pathname;
        return (
          <SidebarMenuItem key={thread.thread_id}>
            <SidebarMenuButton isActive={isActive} asChild>
              <Link
                className="text-muted-foreground whitespace-nowrap"
                href={pathOfThread(thread)}
              >
                {titleOfThread(thread)}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
