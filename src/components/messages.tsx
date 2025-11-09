import type { MessageContentComplex } from "@langchain/core/messages";
import type { AIMessage, Message } from "@langchain/langgraph-sdk";

import { rehypeSplitWordsIntoSpans } from "@/lib/rehype";
import { cn } from "@/lib/utils";

import { Conversation, ConversationContent } from "./ai-elements/conversation";
import {
  Message as ConversationMessage,
  MessageContent as ConversationMessageContent,
  MessageResponse as ConversationMessageResponse,
} from "./ai-elements/message";
import { InnerShadow } from "./inner-shadow";
import { ToolCallView } from "./tool-call-view";

export function Messages({
  className,
  messages,
}: {
  className?: string;
  messages: Array<Message>;
}) {
  return (
    <Conversation
      className={cn("flex h-full w-full justify-center", className)}
    >
      <ConversationContent className="w-full max-w-(--container-width-md) place-self-center pt-12 pb-40">
        {messages.map(
          (message) =>
            shouldRender(message) && (
              <MessageItem
                key={message.id}
                message={message}
                messages={messages}
              />
            ),
        )}
        <InnerShadow />
      </ConversationContent>
    </Conversation>
  );
}

export function shouldRender(message: Message) {
  if (message.type === "tool") {
    return false;
  }
  return true;
}

export function hasToolCalls(message: Message): message is AIMessage {
  return (
    message.type === "ai" &&
    !!message.tool_calls &&
    message.tool_calls.length > 0
  );
}

export function MessageItem({
  message,
  messages,
}: {
  message: Message;
  messages: Message[];
}) {
  return (
    <ConversationMessage from={message.type === "human" ? "user" : "assistant"}>
      <ConversationMessageContent className="relative">
        {typeof message.content === "string" ? (
          <MessageContent>{message.content}</MessageContent>
        ) : (
          message.content.map((content, index) => (
            <MessageContent key={index}>{content}</MessageContent>
          ))
        )}
        {hasToolCalls(message) && message.tool_calls && (
          <div className="flex flex-col gap-2">
            {message.tool_calls.map((tool_call) => (
              <ToolCallView
                key={tool_call.id}
                toolCall={tool_call}
                messages={messages}
              />
            ))}
          </div>
        )}
      </ConversationMessageContent>
    </ConversationMessage>
  );
}

function MessageContent({
  children,
}: {
  children: string | MessageContentComplex | null | undefined;
}) {
  if (!children) {
    return null;
  }
  if (typeof children === "object") {
    if (children.type === "text") {
      return (
        <ConversationMessageResponse
          rehypePlugins={[rehypeSplitWordsIntoSpans]}
        >
          {children.text}
        </ConversationMessageResponse>
      );
    } else if (children.type === "image_url") {
      return (
        <img
          alt={"Image"}
          className="max-w-full rounded-md"
          src={
            typeof children.image_url === "string"
              ? children.image_url
              : children.image_url.url
          }
        />
      );
    }
  }
  return (
    <ConversationMessageResponse rehypePlugins={[rehypeSplitWordsIntoSpans]}>
      {children as string}
    </ConversationMessageResponse>
  );
}
