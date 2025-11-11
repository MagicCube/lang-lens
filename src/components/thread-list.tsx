"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

import { useThreads } from "@/lib/api";
import { pathOfThread, titleOfThread } from "@/lib/thread/utils";
import { cn } from "@/lib/utils";

import { EmptyState } from "./empty-state";
import { InnerShadow } from "./inner-shadow";
import { ScrollArea } from "./ui/scroll-area";

export function ThreadList({ className }: { className?: string }) {
  const { data: threads = [], isLoading } = useThreads({
    limit: 1000,
    sortBy: "updated_at",
    sortOrder: "desc",
  });
  if (threads.length === 0 && !isLoading) {
    return (
      <EmptyState
        icon={<MessageSquare className="size-6" />}
        title="No threads found"
        description="Start a thread to see threads here"
      />
    );
  }
  return (
    <div className={cn("h-full w-full", className)}>
      <ScrollArea className="size-full">
        <div className="h-4"></div>
        {threads.map((thread) => (
          <div
            key={thread.thread_id}
            className="border-b hover:border-transparent"
          >
            <div className="hover:bg-card rounded-lg p-4">
              <Link className="flex flex-col gap-1" href={pathOfThread(thread)}>
                <div className="text-lg">{titleOfThread(thread)}</div>
                <div className="text-muted-foreground text-xs">
                  Last message{" "}
                  {formatDistanceToNow(new Date(thread.updated_at))}
                </div>
              </Link>
            </div>
          </div>
        ))}
        <div className="h-4"></div>
      </ScrollArea>
      <InnerShadow />
    </div>
  );
}
