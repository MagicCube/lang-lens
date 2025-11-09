import type { ToolCall } from "@langchain/core/messages";
import type { Message } from "@langchain/langgraph-sdk";
import { useMemo } from "react";

import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
  type ToolHeaderProps,
} from "./ai-elements/tool";

export function ToolCallView({
  toolCall,
  messages,
}: {
  toolCall: ToolCall;
  messages: Message[];
}) {
  const toolMessage = useMemo(
    () =>
      messages.find(
        (msg) => msg.type === "tool" && msg.tool_call_id === toolCall.id,
      ),
    [messages, toolCall.id],
  );
  const state = useMemo<ToolHeaderProps["state"]>(() => {
    if (toolMessage) {
      return "output-available";
    }
    return "input-available";
  }, [toolMessage]);
  return (
    <Tool>
      <ToolHeader
        state={state}
        title={toolCall.name}
        type={`tool-${toolCall.name}`}
      />
      <ToolContent>
        <ToolInput input={toolCall.args} />
        <ToolOutput
          output={toolMessage?.content as string | undefined}
          errorText=""
        />
      </ToolContent>
    </Tool>
  );
}
