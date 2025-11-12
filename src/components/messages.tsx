import type {
  MessageContentComplex,
  HumanMessage,
} from "@langchain/core/messages";
import type { AIMessage, Message } from "@langchain/langgraph-sdk";
import type { UseStream } from "@langchain/langgraph-sdk/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Copy,
  Edit,
  RefreshCcw,
  CheckIcon,
  X,
  Send,
} from "lucide-react";
import type { BagTemplate } from "node_modules/@langchain/langgraph-sdk/dist/react/types";
import { useCallback, useMemo, useState } from "react";

import {
  extractAIMessageContent,
  extractTextFromMessageContent,
  findPreviousHumanMessageIndex,
} from "@/lib/message";
import { rehypeSplitWordsIntoSpans } from "@/lib/rehype";
import type { MessageThreadValues } from "@/lib/thread";
import { cn } from "@/lib/utils";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "./ai-elements/conversation";
import {
  Message as ConversationMessage,
  MessageContent as ConversationMessageContent,
  MessageResponse as ConversationMessageResponse,
  MessageToolbar,
} from "./ai-elements/message";
import { InnerShadow } from "./inner-shadow";
import { LoadingAnimation } from "./loading";
import { Todos } from "./todos";
import { ToolCallView } from "./tool-call-view";
import { Button } from "./ui/button";
import { ButtonGroup, ButtonGroupText } from "./ui/button-group";
import { Textarea } from "./ui/textarea";

export function Messages({
  className,
  thread,
}: {
  className?: string;
  thread: UseStream<MessageThreadValues, BagTemplate>;
}) {
  return (
    <Conversation
      className={cn("flex h-full w-full flex-col justify-center", className)}
    >
      <ConversationContent className="w-full max-w-(--container-width-md) place-self-center pt-4 pb-48">
        {thread.messages.map(
          (message) =>
            shouldRender(message) && (
              <MessageItem
                key={message.id}
                className={cn(message.type === "human" && "my-4")}
                message={message}
                thread={thread}
              />
            ),
        )}
        <InnerShadow />
        {thread.isLoading && <LoadingAnimation className="m-4" />}
      </ConversationContent>
      <ConversationScrollButton className="-translate-y-16 backdrop-blur-xs" />
    </Conversation>
  );
}

export function MessageItem({
  className,
  message,
  thread,
}: {
  className?: string;
  message: Message;
  thread: UseStream<MessageThreadValues, BagTemplate>;
}) {
  const metadata = useMemo(
    () => thread.getMessagesMetadata(message),
    [message, thread],
  );
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const handleStartEditing = useCallback(
    (messageId: string) => {
      setEditingMessageId(messageId);
      setEditingValue(extractTextFromMessageContent(message.content));
    },
    [setEditingMessageId, message.content],
  );
  const handleCancelEditing = useCallback(() => {
    setEditingMessageId(null);
  }, [setEditingMessageId]);
  const handleSubmitEditing = useCallback(() => {
    const parentCheckpoint = metadata?.firstSeenState?.parent_checkpoint;
    if (!parentCheckpoint) {
      return;
    }
    setEditingMessageId(null);
    void thread.submit(
      {
        messages: [
          {
            type: "human",
            content: [
              {
                type: "text",
                text: editingValue,
              },
            ],
          } as HumanMessage,
        ],
      },
      {
        checkpoint: parentCheckpoint,
        streamMode: ["values"],
        streamSubgraphs: true,
        streamResumable: true,
      },
    );
  }, [editingValue, metadata, thread]);
  const handleRegenerate = useCallback(() => {
    const previousHumanMessageIndex = findPreviousHumanMessageIndex(
      message as AIMessage,
      thread,
    );
    if (previousHumanMessageIndex === -1) {
      return;
    }
    const previousHumanMessage = thread.messages[previousHumanMessageIndex]!;
    const parentCheckpoint =
      thread.getMessagesMetadata(previousHumanMessage)?.firstSeenState
        ?.checkpoint;
    if (!parentCheckpoint) {
      return;
    }
    setEditingMessageId(null);
    void thread.submit(undefined, {
      checkpoint: parentCheckpoint,
      streamSubgraphs: true,
      streamResumable: true,
    });
  }, [message, thread]);
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    let messageContent = "";
    if (message.type === "human") {
      messageContent = extractTextFromMessageContent(message.content);
    } else if (message.type === "ai") {
      messageContent = extractAIMessageContent(message, thread);
    }
    await navigator.clipboard.writeText(messageContent);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }, [message, thread]);
  const showToolbar = useMemo(() => {
    if (editingMessageId) {
      return false;
    }
    if (thread.isLoading) {
      return false;
    }
    if (message.type === "human") {
      return true;
    }
    if (message.type === "ai") {
      const messageIndex = thread.messages.indexOf(message);
      if (messageIndex === thread.messages.length - 1) {
        return true;
      }
      return thread.messages[messageIndex + 1]?.type === "human";
    }
  }, [editingMessageId, message, thread.isLoading, thread.messages]);
  const from = message.type === "human" ? "user" : "assistant";
  const branch = metadata?.branch ?? "main";
  const branches = metadata?.branchOptions ?? ["main"];
  return (
    <ConversationMessage
      className={cn(
        "relative",
        "group/conversation-message",
        message.type === "ai" &&
          "rounded-lg px-4 py-2 transition-colors ease-out",
        className,
      )}
      from={from}
    >
      <div className={cn("flex w-full flex-col gap-2 [&>div]:pb-0", className)}>
        <ConversationMessageContent className="flex flex-col">
          {editingMessageId === message.id ? (
            <form
              className="flex flex-col gap-2"
              onSubmit={handleSubmitEditing}
            >
              <Textarea
                className="min-h-24 w-92 resize-none"
                placeholder="Edit message"
                autoFocus
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.ctrlKey &&
                    !e.metaKey
                  ) {
                    e.preventDefault();
                    handleSubmitEditing();
                  }
                }}
              />
              <div className="self-end">
                <Button
                  className="hover:bg-white/10!"
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                  onClick={handleCancelEditing}
                >
                  <X size={12} />
                </Button>
                <Button
                  className="hover:bg-white/10!"
                  size="icon-sm"
                  type="submit"
                  variant="ghost"
                >
                  <Send size={12} />
                </Button>
              </div>
            </form>
          ) : (
            <MessageContentWithToolCalls message={message} thread={thread} />
          )}
        </ConversationMessageContent>
        {showToolbar && (
          <MessageToolbar
            className={cn(
              from === "user" && "justify-end",
              from === "user" ? "-bottom-5" : "-bottom-9",
              "absolute right-0 left-0 z-20 opacity-0 transition-opacity delay-200 duration-300 group-hover/conversation-message:opacity-100",
            )}
          >
            <BranchSwitch value={branch} options={branches} thread={thread} />
            <div className="flex gap-1">
              <Button
                size="icon-sm"
                type="button"
                variant="ghost"
                onClick={handleCopy}
              >
                {copied ? (
                  <CheckIcon className="text-green-500" size={12} />
                ) : (
                  <Copy size={12} />
                )}
              </Button>
              {from === "user" && (
                <Button
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                  onClick={() => message.id && handleStartEditing(message.id)}
                >
                  <Edit size={12} />
                </Button>
              )}
              {from === "assistant" && (
                <Button
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                  onClick={handleRegenerate}
                >
                  <RefreshCcw size={12} />
                </Button>
              )}
            </div>
          </MessageToolbar>
        )}
      </div>
    </ConversationMessage>
  );
}

function MessageContentWithToolCalls({
  message,
  thread,
}: {
  message: Message;
  thread: UseStream<MessageThreadValues, BagTemplate>;
}) {
  return (
    <>
      {extractContents(message).map((content, index) => (
        <MessageContent key={index} isLoading={thread.isLoading}>
          {content}
        </MessageContent>
      ))}
      <ToolCalls message={message} thread={thread} />
    </>
  );
}

function MessageContent({
  children,
  isLoading,
}: {
  children: MessageContentComplex | string | null | undefined;
  isLoading: boolean;
}) {
  const rehypePlugins = useMemo(
    () => (isLoading ? [rehypeSplitWordsIntoSpans] : []),
    [isLoading],
  );
  if (!children) {
    return null;
  }
  if (typeof children === "object") {
    if (children.type === "text") {
      return (
        <ConversationMessageResponse rehypePlugins={rehypePlugins}>
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
    <ConversationMessageResponse rehypePlugins={rehypePlugins}>
      {children as string}
    </ConversationMessageResponse>
  );
}

function ToolCalls({
  message,
  thread,
}: {
  message: Message;
  thread: UseStream<MessageThreadValues, BagTemplate>;
}) {
  return (
    hasToolCalls(message) &&
    message.tool_calls && (
      <div className="flex flex-col gap-4 pb-2">
        {message.tool_calls.map((tool_call) => (
          <ToolCallView
            key={tool_call.id}
            toolCall={tool_call}
            messages={thread.messages}
          />
        ))}
      </div>
    )
  );
}

function BranchSwitch({
  value,
  options,
  thread,
}: {
  value: string;
  options: string[];
  thread: UseStream<MessageThreadValues, BagTemplate>;
}) {
  const index = options.indexOf(value);
  const totalBranches = options.length;
  if (totalBranches <= 1) {
    return null;
  }
  const handlePrevious = () => {
    const previousIndex = (index - 1 + options.length) % options.length;
    const previousBranch = options[previousIndex];
    thread.setBranch(previousBranch!);
  };
  const handleNext = () => {
    const nextIndex = (index + 1) % options.length;
    const nextBranch = options[nextIndex];
    thread.setBranch(nextBranch!);
  };
  return (
    <ButtonGroup
      className="[&>*:not(:first-child)]:rounded-l-md [&>*:not(:last-child)]:rounded-r-md"
      orientation="horizontal"
    >
      <Button
        size="icon-sm"
        type="button"
        variant="ghost"
        onClick={handlePrevious}
      >
        <ChevronLeftIcon size={12} />
      </Button>
      <ButtonGroupText
        className={cn(
          "text-muted-foreground border-none bg-transparent px-2 shadow-none",
        )}
      >
        {options.indexOf(value) + 1} of {totalBranches}
      </ButtonGroupText>
      <Button size="icon-sm" type="button" variant="ghost" onClick={handleNext}>
        <ChevronRightIcon size={12} />
      </Button>
    </ButtonGroup>
  );
}

function extractContents(message: Message) {
  if (typeof message.content === "string") {
    return [message.content];
  } else {
    return message.content;
  }
}

function shouldRender(message: Message) {
  if (message.type === "tool") {
    return false;
  }
  return true;
}

function hasToolCalls(message: Message): message is AIMessage {
  return (
    message.type === "ai" &&
    !!message.tool_calls &&
    message.tool_calls.length > 0
  );
}
