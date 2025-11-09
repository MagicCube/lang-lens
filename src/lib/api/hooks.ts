import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { MessageThread, MessageThreadValues } from "../thread";

import { apiClient } from "./client";

export function useThreads(
  params: Parameters<typeof apiClient.threads.search>[0] = {
    limit: 50,
    sortBy: "updated_at",
    sortOrder: "desc",
  },
) {
  return useQuery<MessageThread[]>({
    queryKey: ["threads", "search", params],
    queryFn: async () => {
      const response =
        await apiClient.threads.search<MessageThreadValues>(params);
      return response as MessageThread[];
    },
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ threadId }: { threadId: string }) => {
      await apiClient.threads.delete(threadId);
    },
    onSuccess(_, { threadId }) {
      queryClient.setQueriesData(
        {
          queryKey: ["threads", "search"],
          exact: false,
        },
        (oldData: Array<MessageThread>) => {
          return oldData.filter((t) => t.thread_id !== threadId);
        },
      );
    },
  });
}

export function useAssistants(
  params: Parameters<typeof apiClient.assistants.search>[0] = {
    limit: 50,
    sortBy: "name",
    sortOrder: "asc",
  },
) {
  return useQuery({
    queryKey: ["assistants", "search", params],
    queryFn: async () => {
      const response = await apiClient.assistants.search(params);
      return response;
    },
  });
}
