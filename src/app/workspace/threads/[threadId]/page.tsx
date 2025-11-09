"use client";

import type { HumanMessage } from "@langchain/core/messages";
import { useStream } from "@langchain/langgraph-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  redirect,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";

import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { InputBox } from "@/components/input-box";
import { Messages } from "@/components/messages";
import {
  WorkspaceContainer,
  WorkspaceContent,
  WorkspaceFooter,
  WorkspaceHeader,
} from "@/components/workspace";
import { apiClient, useAssistants } from "@/lib/api";
import { type MessageThreadValues } from "@/lib/thread";
import { cn } from "@/lib/utils";

export default function ThreadPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assistantId = searchParams.get("assistantId");
  const [threadId, setThreadId] = useState<string | null>(null);
  const { threadId: threadIdFromPath } = useParams<{ threadId: string }>();
  const isNew = useMemo(() => threadIdFromPath === "new", [threadIdFromPath]);
  useEffect(() => {
    if (threadIdFromPath !== "new") {
      setThreadId(threadIdFromPath);
    } else {
      setThreadId(uuid());
    }
  }, [threadIdFromPath]);
  const { messages, isLoading, isThreadLoading, submit } =
    useStream<MessageThreadValues>({
      client: apiClient,
      assistantId: assistantId!,
      threadId: !isNew ? threadId : undefined,
      reconnectOnMount: true,
    });

  useAssistantMemory(assistantId, isNew);

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      if (isNew) {
        queryClient.setQueryData(
          [
            "threads",
            "search",
            {
              limit: 50,
              sortBy: "updated_at",
              sortOrder: "desc",
            },
          ],
          (oldData) => {
            return [
              {
                thread_id: threadId,
                metadata: { assistant_id: assistantId, graph_id: assistantId },
                values: {
                  messages: [
                    {
                      type: "human",
                      content: [{ type: "text", text: message.text }],
                    },
                  ],
                },
              },
              ...(oldData as Array<unknown>),
            ];
          },
        );
        router.replace(
          `/workspace/threads/${threadId}?assistantId=${assistantId}`,
        );
      }
      await submit(
        {
          messages: [
            {
              type: "human",
              content: [
                {
                  type: "text",
                  text: message.text!,
                },
              ],
            } as HumanMessage,
          ],
        },
        {
          threadId: isNew ? threadId! : undefined,
        },
      );
      void queryClient.invalidateQueries({ queryKey: ["threads", "search"] });
    },
    [assistantId, isNew, queryClient, router, submit, threadId],
  );

  return (
    <WorkspaceContainer>
      <WorkspaceHeader>{isNew ? `New` : threadIdFromPath}</WorkspaceHeader>
      <WorkspaceContent>
        <div className="flex h-full w-full">
          <Messages messages={messages} />
        </div>
      </WorkspaceContent>
      <WorkspaceFooter>
        <InputBox
          className={cn(isNew && "-translate-y-[40vh]")}
          assistantId={assistantId}
          isNewThread={isNew}
          onSubmit={handleSubmit}
        />
      </WorkspaceFooter>
    </WorkspaceContainer>
  );
}

function useAssistantMemory(assistantId: string | null, isNewThread: boolean) {
  const { data: assistants } = useAssistants();
  const DEFAULT_ASSISTANT_ID = useMemo(() => {
    return assistants && assistants.length > 0 ? assistants[0]!.graph_id : null;
  }, [assistants]);
  useEffect(() => {
    if (
      typeof localStorage === "object" &&
      assistants &&
      isNewThread &&
      !assistantId
    ) {
      if (assistants.length > 0) {
        const lastAssistantId = localStorage.getItem(
          "lang-lens/default_assistant_id",
        );
        if (lastAssistantId) {
          const assistant = assistants.find(
            (a) =>
              a.graph_id === lastAssistantId ||
              a.assistant_id === lastAssistantId,
          );
          if (assistant) {
            redirect(`/workspace/threads/new?assistantId=${lastAssistantId}`);
          }
        }
        redirect(`/workspace/threads/new?assistantId=${DEFAULT_ASSISTANT_ID}`);
      } else {
        redirect("/workspace/assistants");
      }
    }
  }, [DEFAULT_ASSISTANT_ID, assistantId, assistants, isNewThread]);

  useEffect(() => {
    if (assistantId && isNewThread) {
      localStorage.setItem("lang-lens/default_assistant_id", assistantId);
    }
  }, [assistantId, isNewThread]);
}
