import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const applyTheme = (theme: string) => {
  const root = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("light", !prefersDark);
  } else if (theme === "light") {
    root.classList.add("light");
  } else {
    root.classList.remove("light");
  }
};

export const useTheme = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Default to dark (no light class)
      document.documentElement.classList.remove("light");
      return;
    }

    const loadTheme = async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("theme_preference")
        .eq("user_id", user.id)
        .maybeSingle();

      applyTheme(data?.theme_preference || "system");
    };

    loadTheme();
  }, [user]);
};

export { applyTheme };
