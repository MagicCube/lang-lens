"use client";

import { formatDistanceToNow } from "date-fns";
import { BotMessageSquare, BotOff } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  WorkspaceContainer,
  WorkspaceContent,
  WorkspaceHeader,
} from "@/components/workspace";
import { useAssistants } from "@/lib/api";
import { cn } from "@/lib/utils";

const CANDY_GRADIENTS = [
  "bg-gradient-to-br from-pink-400 to-purple-500",
  "bg-gradient-to-br from-blue-400 to-cyan-500",
  "bg-gradient-to-br from-green-400 to-teal-500",
  "bg-gradient-to-br from-yellow-400 to-orange-500",
  "bg-gradient-to-br from-red-400 to-pink-500",
  "bg-gradient-to-br from-purple-400 to-indigo-500",
  "bg-gradient-to-br from-indigo-400 to-blue-500",
  "bg-gradient-to-br from-cyan-400 to-green-500",
  "bg-gradient-to-br from-teal-400 to-emerald-500",
  "bg-gradient-to-br from-orange-400 to-red-500",
  "bg-gradient-to-br from-rose-400 to-pink-500",
  "bg-gradient-to-br from-fuchsia-400 to-purple-500",
  "bg-gradient-to-br from-violet-400 to-indigo-500",
  "bg-gradient-to-br from-sky-400 to-blue-500",
  "bg-gradient-to-br from-lime-400 to-green-500",
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-pink-500 to-rose-600",
  "bg-gradient-to-br from-purple-500 to-fuchsia-600",
  "bg-gradient-to-br from-blue-500 to-indigo-600",
  "bg-gradient-to-br from-green-500 to-cyan-600",
  "bg-gradient-to-br from-yellow-500 to-amber-600",
  "bg-gradient-to-br from-red-500 to-orange-600",
  "bg-gradient-to-br from-teal-500 to-green-600",
  "bg-gradient-to-br from-indigo-500 to-purple-600",
];

export default function AssistantsPage() {
  const { data: assistants = [], isLoading } = useAssistants();
  if (isLoading) {
    return null;
  }
  return (
    <WorkspaceContainer>
      <WorkspaceHeader />
      <WorkspaceContent className="py-4">
        {assistants.length === 0 ? (
          <EmptyState
            icon={<BotOff className="size-6" />}
            title="No assistant found yet"
            description={
              <a
                className="hover:underline"
                href="https://docs.langchain.com/langsmith/cli"
                target="_blank"
                rel="noreferrer"
              >
                Create an assistant and list it in your
                &quot;langgraph.js&quot;.
              </a>
            }
          />
        ) : (
          <div className="grid w-full max-w-(--container-width-lg) grid-cols-3 gap-4">
            {assistants.map((assistant) => (
              <Link
                key={assistant.assistant_id}
                href={`/workspace/threads/new?assistantId=${assistant.graph_id}`}
              >
                <Card
                  key={assistant.assistant_id}
                  className={cn(
                    "card-hover-effect aspect-video w-full",
                    gradientFromId(assistant.assistant_id),
                  )}
                >
                  <CardHeader>
                    <CardTitle className="text-shadow-3xs">
                      <div className="flex items-center gap-2">
                        <BotMessageSquare />
                        <span>{assistant.graph_id}</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      <div className="text-foreground/80 text-xs">
                        <span>Updated</span>&nbsp;
                        <span>
                          {formatDistanceToNow(new Date(assistant.updated_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardFooter></CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </WorkspaceContent>
    </WorkspaceContainer>
  );
}

function gradientFromId(id: string) {
  if (id) {
    const hex = id.slice(id.length - 2, id.length);
    const decimal = parseInt(hex, 16) % CANDY_GRADIENTS.length;
    if (!isNaN(decimal) && CANDY_GRADIENTS[decimal]) {
      return CANDY_GRADIENTS[decimal];
    }
  }
  return CANDY_GRADIENTS[0];
}
