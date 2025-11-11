import type {
  BaseMessage,
  MessageContentComplex,
} from "@langchain/core/messages";
import type { AIMessage } from "@langchain/langgraph-sdk";
import type { UseStream } from "@langchain/langgraph-sdk/react";
import type { BagTemplate } from "node_modules/@langchain/langgraph-sdk/dist/react/types";

import type { MessageThreadValues } from "../thread";

export function extractTextFromMessageContent(
  content: MessageContentComplex | string,
): string {
  if (typeof content === "string") {
    return content;
  } else if (Array.isArray(content)) {
    return content
      .map((part) => extractTextFromMessageContent(part))
      .join("\n\n")
      .trim();
  } else if (typeof content === "object" && content) {
    return content.type === "text" ? content.text : "";
  }
  return "";
}

export function extractAIMessageContent(
  message: AIMessage,
  thread: UseStream<MessageThreadValues, BagTemplate>,
): string {
  const messageIndex = thread.values.messages.indexOf(message as BaseMessage);
  // 往前找第一个 human 消息
  const previousHumanMessage = thread.values.messages.find(
    (msg, index) => index < messageIndex && msg.type === "human",
  );
  if (!previousHumanMessage) {
    return extractTextFromMessageContent(message.content);
  }
  const previousHumanMessageIndex =
    thread.values.messages.indexOf(previousHumanMessage);
  let content = "";
  for (let i = previousHumanMessageIndex + 1; i <= messageIndex; i++) {
    const msg = thread.values.messages[i]!;
    if (msg.type === "ai") {
      content += extractTextFromMessageContent(msg.content) + "\n\n";
    }
  }
  return content.trim();
}
