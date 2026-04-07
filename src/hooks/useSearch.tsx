import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  projects: {
    id: string;
    slug: string;
    title: string;
    description: string;
  }[];
  blocks: {
    id: string;
    project_id: string;
    content: string;
    type: string;
    project_slug?: string;
    project_title?: string;
  }[];
}

export const useSearch = (query: string) => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async (): Promise<SearchResult> => {
      if (!query || query.length < 2) {
        return { projects: [], blocks: [] };
      }

      // Format query for Postgres full-text search
      const searchQuery = query
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => `${word}:*`)
        .join(" & ");

      // Search projects
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, slug, title, description")
        .textSearch("search_vector", searchQuery);

      if (projectsError) throw projectsError;

      // Search content blocks
      const { data: blocks, error: blocksError } = await supabase
        .from("content_blocks")
        .select("id, project_id, content, type")
        .textSearch("search_vector", searchQuery)
        .limit(20);

      if (blocksError) throw blocksError;

      // Get project info for blocks
      const projectIds = [...new Set(blocks?.map((b) => b.project_id) || [])];
      let projectsMap: Record<string, { slug: string; title: string }> = {};

      if (projectIds.length > 0) {
        const { data: projectsInfo } = await supabase
          .from("projects")
          .select("id, slug, title")
          .in("id", projectIds);

        projectsMap = (projectsInfo || []).reduce(
          (acc, p) => ({ ...acc, [p.id]: { slug: p.slug, title: p.title } }),
          {}
        );
      }

      const enrichedBlocks = (blocks || []).map((block) => ({
        ...block,
        project_slug: projectsMap[block.project_id]?.slug,
        project_title: projectsMap[block.project_id]?.title,
      }));

      return {
        projects: projects || [],
        blocks: enrichedBlocks,
      };
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
};
