import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  github_url: string | null;
  live_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithSkills extends Project {
  skills: { id: string; title: string; icon: string }[];
}

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data: projects, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get skill associations for each project
      const projectsWithSkills: ProjectWithSkills[] = await Promise.all(
        (projects || []).map(async (project) => {
          const { data: projectSkills } = await supabase
            .from("project_skills")
            .select("skill_id, skills(id, title, icon)")
            .eq("project_id", project.id);

          const skills = (projectSkills || [])
            .map((ps: any) => ps.skills)
            .filter(Boolean);

          return {
            ...project,
            skills,
          };
        })
      );

      return projectsWithSkills;
    },
  });
};

export const useProject = (slug: string) => {
  return useQuery({
    queryKey: ["project", slug],
    queryFn: async () => {
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;

      const { data: projectSkills } = await supabase
        .from("project_skills")
        .select("skill_id, skills(id, title, icon)")
        .eq("project_id", project.id);

      const skills = (projectSkills || [])
        .map((ps: any) => ps.skills)
        .filter(Boolean);

      const { data: contentBlocks } = await supabase
        .from("content_blocks")
        .select("*")
        .eq("project_id", project.id)
        .order("order_index", { ascending: true });

      return {
        ...project,
        skills,
        contentBlocks: contentBlocks || [],
      };
    },
    enabled: !!slug,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      project,
      skillIds,
    }: {
      project: Omit<Project, "id" | "created_at" | "updated_at">;
      skillIds: string[];
    }) => {
      const { data, error } = await supabase
        .from("projects")
        .insert(project)
        .select()
        .single();

      if (error) throw error;

      // Add skill associations
      if (skillIds.length > 0) {
        const { error: skillError } = await supabase.from("project_skills").insert(
          skillIds.map((skillId) => ({
            project_id: data.id,
            skill_id: skillId,
          }))
        );
        if (skillError) throw skillError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      project,
      skillIds,
    }: {
      id: string;
      project: Partial<Omit<Project, "id" | "created_at" | "updated_at">>;
      skillIds: string[];
    }) => {
      const { data, error } = await supabase
        .from("projects")
        .update(project)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update skill associations
      await supabase.from("project_skills").delete().eq("project_id", id);

      if (skillIds.length > 0) {
        const { error: skillError } = await supabase.from("project_skills").insert(
          skillIds.map((skillId) => ({
            project_id: id,
            skill_id: skillId,
          }))
        );
        if (skillError) throw skillError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
};
