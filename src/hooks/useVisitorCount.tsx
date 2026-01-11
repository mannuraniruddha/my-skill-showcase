import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VisitorStats {
  totalVisits: number;
  uniqueVisitors: number;
}

// Generate or retrieve a unique visitor ID
const getVisitorId = (): string => {
  const storageKey = "visitor_id";
  let visitorId = localStorage.getItem(storageKey);
  
  if (!visitorId) {
    // Generate a unique ID using crypto API
    visitorId = crypto.randomUUID();
    localStorage.setItem(storageKey, visitorId);
  }
  
  return visitorId;
};

export const useVisitorCount = () => {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Check if this session has already been counted
        const hasTrackedSession = sessionStorage.getItem("visitor_tracked");

        if (hasTrackedSession) {
          // Just fetch the current stats without tracking again
          const { data: totalData } = await supabase
            .from("site_stats")
            .select("stat_value")
            .eq("stat_key", "total_visits")
            .single();

          const { data: uniqueData } = await supabase
            .from("site_stats")
            .select("stat_value")
            .eq("stat_key", "unique_visitors")
            .single();

          setStats({
            totalVisits: totalData?.stat_value ?? 0,
            uniqueVisitors: uniqueData?.stat_value ?? 0,
          });
        } else {
          // Get visitor ID and track the visit
          const visitorId = getVisitorId();
          
          const { data, error } = await supabase.rpc("track_visitor", {
            p_visitor_id: visitorId,
          });

          if (error) throw error;
          
          if (data && data.length > 0) {
            setStats({
              totalVisits: data[0].total_visits ?? 0,
              uniqueVisitors: data[0].unique_visitors ?? 0,
            });
          }

          // Mark this session as tracked
          sessionStorage.setItem("visitor_tracked", "true");
        }
      } catch (error) {
        console.error("Error tracking visitor:", error);
        setStats({ totalVisits: 0, uniqueVisitors: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    trackVisitor();
  }, []);

  // Return both individual stats and combined for backward compatibility
  return { 
    stats,
    count: stats?.totalVisits ?? null, // backward compat
    isLoading 
  };
};
