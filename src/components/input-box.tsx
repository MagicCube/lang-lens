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
  isNewThread,
  onSubmit,
  ...props
}: Omit<ComponentProps<typeof PromptInput>, "onSubmit"> & {
  assistantId?: string | null;
  isNewThread?: boolean;
  onSubmit?: (message: PromptInputMessage) => void;
}) {
  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      if (!message.text) {
        return;
      }
      onSubmit?.(message);
    },
    [onSubmit],
  );
  return (
    <PromptInput
      className={cn(
        "rounded-3xl drop-shadow-2xl backdrop-blur-xs *:data-[slot='input-group']:rounded-3xl",
        className,
      )}
      globalDrop
      multiple
      onSubmit={handleSubmit}
      {...props}
    >
      {isNewThread && (
        <EmptyState
          className="absolute -top-36"
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
          className={cn(
            "pl-4 transition-[width,height] duration-300",
            !isNewThread ? "min-h-1!" : "",
          )}
          autoFocus
        />
      </PromptInputBody>
      <PromptInputFooter className="flex">
        <div></div>
        <div className="flex items-center gap-2">
          <PromptInputSubmit
            className="rounded-full"
            variant="outline"
            status="ready"
          />
        </div>
      </PromptInputFooter>
    </PromptInput>
  );
}
