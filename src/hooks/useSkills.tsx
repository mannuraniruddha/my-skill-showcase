import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Skill {
  id: string;
  title: string;
  description: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface SkillWithProjects extends Skill {
  projectCount: number;
  projects: { id: string; title: string; slug: string }[];
}

export const useSkills = () => {
  return useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data: skills, error } = await supabase
        .from("skills")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Get project associations for each skill
      const skillsWithProjects: SkillWithProjects[] = await Promise.all(
        (skills || []).map(async (skill) => {
          const { data: projectSkills } = await supabase
            .from("project_skills")
            .select("project_id, projects(id, title, slug)")
            .eq("skill_id", skill.id);

          const projects = (projectSkills || [])
            .map((ps: any) => ps.projects)
            .filter(Boolean);

          return {
            ...skill,
            projectCount: projects.length,
            projects,
          };
        })
      );

      return skillsWithProjects;
    },
  });
};

export const useCreateSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (skill: Omit<Skill, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("skills")
        .insert(skill)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
};

export const useUpdateSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...skill }: Partial<Skill> & { id: string }) => {
      const { data, error } = await supabase
        .from("skills")
        .update(skill)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
};

export const useDeleteSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
};
