"use client";

import { useParams } from "next/navigation";

import { ThreadTable } from "@/components/thread-table";
import {
  WorkspaceContainer,
  WorkspaceContent,
  WorkspaceHeader,
} from "@/components/workspace";

export default function ThreadsPage() {
  const { threadId } = useParams<{ threadId: string }>();
  return (
    <WorkspaceContainer>
      <WorkspaceHeader>{threadId}</WorkspaceHeader>
      <WorkspaceContent>
        <div className="flex size-full justify-center pt-8">
          <ThreadTable className="w-h max-w-(--container-width-lg)" />
        </div>
      </WorkspaceContent>
    </WorkspaceContainer>
  );
}
