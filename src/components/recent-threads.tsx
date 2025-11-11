"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

import { useDeleteThread, useThreads } from "@/lib/api";
import { pathOfThread, titleOfThread } from "@/lib/thread/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

export function RecentThreads() {
  const pathname = usePathname();
  const { data: threads = [] } = useThreads();
  const { mutate: deleteThread } = useDeleteThread();
  const handleDelete = useCallback(
    (threadId: string) => {
      deleteThread({ threadId });
    },
    [deleteThread],
  );
  if (threads.length === 0) {
    return null;
  }
  return (
    <>
      <SidebarGroupLabel>Recents</SidebarGroupLabel>
      <SidebarMenu>
        {threads.map((thread) => {
          const isActive = pathOfThread(thread, false) === pathname;
          return (
            <SidebarMenuItem
              key={thread.thread_id}
              className="group/side-menu-item"
            >
              <SidebarMenuButton isActive={isActive} asChild>
                <div>
                  <Link
                    className="text-muted-foreground block w-full whitespace-nowrap group-hover/side-menu-item:overflow-hidden"
                    href={pathOfThread(thread)}
                  >
                    {titleOfThread(thread)}
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction
                        showOnHover
                        className="bg-background/80 hover:bg-background"
                      >
                        <MoreHorizontal />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 rounded-lg"
                      side={"right"}
                      align={"start"}
                    >
                      <DropdownMenuItem
                        onSelect={() => handleDelete(thread.thread_id)}
                      >
                        <Trash2 className="text-muted-foreground" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </>
  );
}
