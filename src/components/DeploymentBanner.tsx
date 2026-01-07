import { useState, useMemo } from "react";
import { CheckCircle, AlertTriangle, ExternalLink, X } from "lucide-react";

const DeploymentBanner = () => {
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem("deployment-banner-dismissed") === "true";
    } catch {
      return false;
    }
  });

  // Only show in production
  if (!import.meta.env.PROD || isDismissed) return null;

  const basePath = import.meta.env.BASE_URL;
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const isBasePathValid = currentPath.startsWith(basePath) || basePath === "/";
  
  // Compute Pages URL dynamically
  const pagesUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URL(basePath, window.location.origin).toString();
  }, [basePath]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem("deployment-banner-dismissed", "true");
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${isBasePathValid ? "bg-emerald-600" : "bg-amber-600"} text-white px-4 py-2`}>
      <div className="container mx-auto flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {isBasePathValid ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span className="font-medium">
              {isBasePathValid ? "Deployment Active" : "Base Path Mismatch"}
            </span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-white/30" />
          <span className="opacity-90">
            Base: <code className="bg-black/20 px-1.5 py-0.5 rounded text-xs">{basePath}</code>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={pagesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline font-medium"
          >
            View Live
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-emerald-700 rounded transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeploymentBanner;
