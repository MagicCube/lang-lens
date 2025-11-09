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
        "rounded-3xl drop-shadow-2xl backdrop-blur-xs transition-all duration-300 ease-out *:data-[slot='input-group']:rounded-3xl",
        isNewThread
          ? "max-w-(--container-width-sm)"
          : "focus-within:bg-background/85 h-12 max-w-(--container-width-xs) overflow-hidden focus-within:h-fit focus-within:max-w-(--container-width-md)",
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
          className={cn("pl-4", isNewThread ? "min-h-24!" : "min-h-1!")}
          placeholder="How can I assist you today?"
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
