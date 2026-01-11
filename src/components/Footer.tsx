import { Github, Linkedin, Mail, Eye, Users } from "lucide-react";
import { useVisitorCount } from "@/hooks/useVisitorCount";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { stats, isLoading } = useVisitorCount();

  const formatCount = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <footer className="py-12 border-t border-border">
      <div className="container px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              © {currentYear} <span className="text-primary">Aniruddha Mannur</span>
            </span>
          </div>

          <TooltipProvider>
            <div className="flex items-center gap-4 text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <Eye className="w-4 h-4" />
                    {isLoading ? (
                      <Skeleton className="h-4 w-12" />
                    ) : (
                      <span className="font-mono text-sm">
                        {formatCount(stats?.totalVisits ?? 0)}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total page visits</p>
                </TooltipContent>
              </Tooltip>

              <span className="text-border">|</span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <Users className="w-4 h-4" />
                    {isLoading ? (
                      <Skeleton className="h-4 w-12" />
                    ) : (
                      <span className="font-mono text-sm">
                        {formatCount(stats?.uniqueVisitors ?? 0)}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Unique visitors</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/mannuraniruddha"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/aniruddha-mannur/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="mailto:mannur.aniruddha@gmail.com"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          <p className="text-xs text-muted-foreground font-mono">
            Built with React & TypeScript
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
