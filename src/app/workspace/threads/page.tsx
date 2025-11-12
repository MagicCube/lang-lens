"use client";

import { MessageSquare } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { EmptyState } from "@/components/empty-state";
import { Threads } from "@/components/threads";
import {
  WorkspaceContainer,
  WorkspaceContent,
  WorkspaceHeader,
} from "@/components/workspace";
import { useThreads } from "@/lib/api";

export default function ThreadsPage() {
  const searchParams = useSearchParams();
  const assistantId = searchParams.get("assistantId");
  const { data = [], isLoading } = useThreads({
    limit: 1000,
    sortBy: "updated_at",
    sortOrder: "desc",
  });
  const threads = useMemo(() => {
    if (!assistantId) {
      return data;
    }
    return data.filter((thread) => {
      return thread.metadata.graph_id === assistantId;
    });
  }, [data, assistantId]);
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
    <WorkspaceContainer>
      <WorkspaceHeader>{assistantId}</WorkspaceHeader>
      <WorkspaceContent>
        <Threads
          className="w-full max-w-(--container-width-lg)"
          threads={threads}
        />
      </WorkspaceContent>
    </WorkspaceContainer>
  );
}
