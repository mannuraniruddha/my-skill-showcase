import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ContentBlock {
  id: string;
  project_id: string;
  type: "markdown" | "code" | "output" | "image" | "text";
  content: string;
  metadata: Record<string, any>;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const useContentBlocks = (projectId: string) => {
  return useQuery({
    queryKey: ["content_blocks", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_blocks")
        .select("*")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as ContentBlock[];
    },
    enabled: !!projectId,
  });
};

export const useCreateContentBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      block: Omit<ContentBlock, "id" | "created_at" | "updated_at">
    ) => {
      const { data, error } = await supabase
        .from("content_blocks")
        .insert(block)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["content_blocks", data.project_id] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
};

export const useUpdateContentBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...block
    }: Partial<ContentBlock> & { id: string }) => {
      const { data, error } = await supabase
        .from("content_blocks")
        .update(block)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["content_blocks", data.project_id] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
};

export const useDeleteContentBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase.from("content_blocks").delete().eq("id", id);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ["content_blocks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
};

export const useReorderContentBlocks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      blocks,
    }: {
      projectId: string;
      blocks: { id: string; order_index: number }[];
    }) => {
      for (const block of blocks) {
        const { error } = await supabase
          .from("content_blocks")
          .update({ order_index: block.order_index })
          .eq("id", block.id);

        if (error) throw error;
      }
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ["content_blocks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
};
