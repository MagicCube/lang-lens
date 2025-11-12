"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import type { MessageThread } from "@/lib/thread/types";
import { pathOfThread, titleOfThread } from "@/lib/thread/utils";
import { cn } from "@/lib/utils";

import { InnerShadow } from "./inner-shadow";
import { ScrollArea } from "./ui/scroll-area";

export function Threads({
  className,
  threads,
}: {
  className?: string;
  threads: MessageThread[];
}) {
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
                <div className="text-lg">
                  <span>{titleOfThread(thread)}</span>
                </div>
                <div className="text-muted-foreground text-xs">
                  <span>{thread.metadata.graph_id}</span>
                  <span className="mx-1 opacity-50">|</span>
                  <span>
                    Last message{" "}
                    {formatDistanceToNow(new Date(thread.updated_at))}
                  </span>
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
