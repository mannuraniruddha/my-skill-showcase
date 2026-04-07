import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type ContentBlock } from "./useContentBlocks";

interface PaginatedContentResult {
  blocks: ContentBlock[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export const usePaginatedContent = (
  projectId: string,
  page: number = 1,
  pageSize: number = 10
) => {
  return useQuery({
    queryKey: ["paginated_content", projectId, page, pageSize],
    queryFn: async (): Promise<PaginatedContentResult> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("content_blocks")
        .select("*", { count: "exact" })
        .eq("project_id", projectId)
        .order("order_index", { ascending: true })
        .range(from, to);

      if (error) throw error;

      return {
        blocks: (data as ContentBlock[]) || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page,
        pageSize,
      };
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
