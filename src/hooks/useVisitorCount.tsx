import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVisitorCount = () => {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndIncrementCount = async () => {
      try {
        // Check if this session has already been counted
        const hasVisited = sessionStorage.getItem("visitor_counted");

        if (hasVisited) {
          // Just fetch the current count without incrementing
          const { data, error } = await supabase
            .from("site_stats")
            .select("stat_value")
            .eq("stat_key", "visitor_count")
            .single();

          if (error) throw error;
          setCount(data?.stat_value ?? 0);
        } else {
          // Increment and get the new count
          const { data, error } = await supabase.rpc("increment_visitor_count");

          if (error) throw error;
          setCount(data ?? 0);

          // Mark this session as counted
          sessionStorage.setItem("visitor_counted", "true");
        }
      } catch (error) {
        console.error("Error fetching visitor count:", error);
        setCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndIncrementCount();
  }, []);

  return { count, isLoading };
};
