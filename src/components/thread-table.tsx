"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { useThreads } from "@/lib/api";
import { pathOfThread, titleOfThread } from "@/lib/thread/utils";
import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export function ThreadTable({ className }: { className?: string }) {
  const { data: threads = [] } = useThreads({
    limit: 1000,
    sortBy: "updated_at",
    sortOrder: "desc",
  });
  if (threads.length === 0) {
    return null;
  }
  return (
    <Table className={cn("table-fixed", className)}>
      <colgroup>
        <col />
        <col className="w-42" />
        <col className="w-42" />
      </colgroup>
      <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-sm">
        <TableRow>
          <TableHead className="font-bold">First Message</TableHead>
          <TableHead className="text-muted-foreground font-bold">
            Assistant
          </TableHead>
          <TableHead className="text-muted-foreground font-bold">
            Updated At
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {threads.map((thread) => (
          <TableRow key={thread.thread_id}>
            <TableCell className="truncate">
              <Link href={pathOfThread(thread)}>{titleOfThread(thread)}</Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {thread.metadata.graph_id}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDistanceToNow(new Date(thread.updated_at))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
