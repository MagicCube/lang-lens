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
    return content.trim();
  } else if (Array.isArray(content)) {
    return content
      .map((part) => extractTextFromMessageContent(part))
      .filter((text) => text.trim())
      .join("\n\n")
      .trim();
  } else if (typeof content === "object" && content) {
    return content.type === "text" ? content.text.trim() : "";
  }
  return "";
}

export function extractAIMessageContent(
  message: AIMessage,
  thread: UseStream<MessageThreadValues, BagTemplate>,
): string {
  const messageIndex = thread.values.messages.indexOf(message as BaseMessage);
  let previousHumanMessageIndex = -1;
  for (let i = messageIndex - 1; i >= 0; i--) {
    const msg = thread.values.messages[i]!;
    if (msg.type === "human") {
      previousHumanMessageIndex = i;
      break;
    }
  }
  if (previousHumanMessageIndex === -1) {
    return extractTextFromMessageContent(message.content);
  }
  let content = "";
  for (let i = previousHumanMessageIndex + 1; i <= messageIndex; i++) {
    const msg = thread.values.messages[i]!;
    if (msg.type === "ai") {
      const extracted = extractTextFromMessageContent(msg.content);
      if (extracted.trim()) {
        content += extracted + "\n\n";
      }
    }
  }
  return content.trim();
}
