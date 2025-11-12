import { useMemo } from "react";

import { cn } from "@/lib/utils";

import {
  Queue,
  QueueItem,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
  QueueItemContent,
  type QueueTodo,
} from "./ai-elements/queue";

export function Todos({
  className,
  todos = [],
}: {
  className?: string;
  todos?: QueueTodo[];
}) {
  const completedTodos = useMemo(() => {
    const count = todos.filter((todo) => todo.status === "completed").length;
    if (count === 0) {
      return "";
    } else if (count === todos.length) {
      return `, all done`;
    } else {
      return `, ${count} completed`;
    }
  }, [todos]);
  if (todos.length === 0) {
    return null;
  }
  return (
    <Queue className={cn("bg-card", className)}>
      <QueueSection defaultOpen={false}>
        <QueueSectionTrigger>
          <QueueSectionLabel
            count={todos.length}
            label={`todo item${todos.length > 1 ? "s" : ""}${completedTodos}`}
          />
        </QueueSectionTrigger>
        <QueueSectionContent>
          <QueueList>
            {todos.map((todo) => (
              <QueueItem
                key={todo.id ?? todo.content ?? todo.title ?? todo.description}
              >
                <div className="flex items-center gap-2">
                  <QueueItemIndicator completed={todo.status === "completed"} />
                  <QueueItemContent completed={todo.status === "completed"}>
                    {todo.content ?? todo.title ?? todo.description}
                  </QueueItemContent>
                </div>
              </QueueItem>
            ))}
          </QueueList>
        </QueueSectionContent>
      </QueueSection>
    </Queue>
  );
}
