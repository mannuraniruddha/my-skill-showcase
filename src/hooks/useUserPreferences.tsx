import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type PythonLevel = "beginner" | "intermediate" | "expert";

export const useUserPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pythonLevel, isLoading } = useQuery({
    queryKey: ["user-preferences", user?.id],
    queryFn: async (): Promise<PythonLevel> => {
      if (!user) return "beginner";

      const { data, error } = await supabase
        .from("user_preferences")
        .select("python_level")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return "beginner";
      return (data.python_level as PythonLevel) || "beginner";
    },
    enabled: !!user,
  });

  const { mutateAsync: setPythonLevel } = useMutation({
    mutationFn: async (level: PythonLevel) => {
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("user_preferences")
          .update({ python_level: level, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_preferences")
          .insert({ user_id: user.id, python_level: level });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-preferences", user?.id] });
    },
  });

  return {
    pythonLevel: (pythonLevel as PythonLevel) || "beginner",
    isLoading,
    setPythonLevel,
    isAuthenticated: !!user,
  };
};
