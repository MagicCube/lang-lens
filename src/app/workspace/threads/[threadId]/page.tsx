"use client";

import { todo } from "node:test";

import type { AIMessage, HumanMessage } from "@langchain/core/messages";
import type { ToolMessage } from "@langchain/langgraph-sdk";
import { useStream } from "@langchain/langgraph-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";

import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import type { QueueTodo } from "@/components/ai-elements/queue";
import { InputBox } from "@/components/input-box";
import { Messages } from "@/components/messages";
import { Todos } from "@/components/todos";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
  const thread = useStream<MessageThreadValues>({
    client: apiClient,
    assistantId: assistantId!,
    threadId: !isNew ? threadId : undefined,
    reconnectOnMount: true,
    fetchStateHistory: true,
  });

  const [todos, setTodos] = useState<QueueTodo[]>([]);
  useEffect(() => {
    const todoCallMessages = thread.messages.filter(
      (message) =>
        message.type === "ai" &&
        message.tool_calls?.some((toolCall) => toolCall.name === "write_todos"),
    );
    if (todoCallMessages.length === 0) {
      return undefined;
    }
    const lastTodoCallMessage = todoCallMessages[
      todoCallMessages.length - 1
    ] as AIMessage;
    const lastTodoToolCall = lastTodoCallMessage.tool_calls!.find(
      (toolCall) => toolCall.name === "write_todos",
    )!;
    if (lastTodoToolCall.args.todos) {
      setTodos(lastTodoToolCall.args.todos);
    }
  }, [thread.messages]);

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
          (oldData: Array<unknown>) => {
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
              ...oldData,
            ];
          },
        );
        router.replace(
          `/workspace/threads/${threadId}?assistantId=${assistantId}&autoFocus=true`,
        );
      }
      await thread.submit(
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
          streamSubgraphs: true,
          streamResumable: true,
        },
      );
      void queryClient.invalidateQueries({ queryKey: ["threads", "search"] });
    },
    [assistantId, isNew, queryClient, router, thread, threadId],
  );

  const handleStop = useCallback(() => {
    void thread.stop();
  }, [thread]);

  return (
    <WorkspaceContainer>
      <WorkspaceHeader>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href={`/workspace/threads?assistantId=${assistantId}`}>
              {assistantId}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem className="hidden md:block">{threadId}</BreadcrumbItem>
      </WorkspaceHeader>
      <WorkspaceContent>
        <div className="flex h-full w-full flex-col">
          <Todos
            className="mt-2 w-full max-w-(--container-width-md) place-self-center"
            todos={todos}
          />
          <Messages thread={thread} />
        </div>
      </WorkspaceContent>
      <WorkspaceFooter>
        <InputBox
          className={cn(isNew && "-translate-y-[33vh]")}
          assistantId={assistantId}
          status={thread.isLoading ? "streaming" : "ready"}
          isNew={isNew}
          autoFocus={isNew || searchParams.get("autoFocus") === "true"}
          onSubmit={handleSubmit}
          onStop={handleStop}
        />
      </WorkspaceFooter>
    </WorkspaceContainer>
  );
}

function useAssistantMemory(assistantId: string | null, isNewThread: boolean) {
  const router = useRouter();
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
            router.replace(
              `/workspace/threads/new?assistantId=${lastAssistantId}`,
            );
            return;
          }
        }
        router.replace(
          `/workspace/threads/new?assistantId=${DEFAULT_ASSISTANT_ID}`,
        );
        return;
      } else {
        router.replace("/workspace/assistants");
        return;
      }
    }
  }, [DEFAULT_ASSISTANT_ID, assistantId, assistants, isNewThread, router]);

  useEffect(() => {
    if (assistantId && isNewThread) {
      localStorage.setItem("lang-lens/default_assistant_id", assistantId);
    }
  }, [assistantId, isNewThread]);
}
