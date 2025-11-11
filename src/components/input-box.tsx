import type { ChatStatus } from "ai";
import { MessageSquarePlus } from "lucide-react";
import { useCallback, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "./ai-elements/prompt-input";
import { EmptyState } from "./empty-state";

export function InputBox({
  className,
  assistantId,
  isNew,
  autoFocus,
  status = "ready",
  onSubmit,
  onStop,
  ...props
}: Omit<ComponentProps<typeof PromptInput>, "onSubmit"> & {
  assistantId?: string | null;
  isNew?: boolean;
  status?: ChatStatus;
  onSubmit?: (message: PromptInputMessage) => void;
  onStop?: () => void;
}) {
  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      if (status === "streaming") {
        onStop?.();
        return;
      }
      if (!message.text) {
        return;
      }
      onSubmit?.(message);
    },
    [onStop, onSubmit, status],
  );
  return (
    <PromptInput
      className={cn(
        "rounded-3xl drop-shadow-2xl backdrop-blur-xs transition-all duration-300 ease-out *:data-[slot='input-group']:rounded-3xl",
        isNew
          ? "max-w-(--container-width-sm)"
          : "focus-within:bg-background/85 h-12 max-w-(--container-width-xs) translate-y-4 overflow-hidden focus-within:h-fit focus-within:max-w-(--container-width-md) focus-within:translate-y-0",
        className,
      )}
      globalDrop
      multiple
      onSubmit={handleSubmit}
      {...props}
    >
      {isNew && (
        <EmptyState
          className="absolute -top-28"
          description="Messages will appear here as the conversation progresses."
          icon={<MessageSquarePlus className="size-6" />}
          title={`Start a conversation with "${assistantId}"`}
        />
      )}
      <PromptInputBody>
        <div className="flex w-full pl-2">
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </div>
        <PromptInputTextarea
          className={cn("pl-4", isNew ? "" : "min-h-1!")}
          placeholder="How can I assist you today?"
          autoFocus={autoFocus}
        />
      </PromptInputBody>
      <PromptInputFooter className="flex">
        <div></div>
        <div className="flex items-center gap-2">
          <PromptInputSubmit
            className="rounded-full"
            variant="outline"
            status={status}
          />
        </div>
      </PromptInputFooter>
    </PromptInput>
  );
}
