import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, FolderOpen } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/useSearch";
import { highlightMatches, getMatchSnippet } from "@/lib/highlight";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchCommand = ({ open, onOpenChange }: SearchCommandProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { data: results, isLoading } = useSearch(query);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const handleSelect = (slug: string) => {
    navigate(`/projects/${slug}`);
    onOpenChange(false);
  };

  const hasResults =
    (results?.projects?.length || 0) + (results?.blocks?.length || 0) > 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search projects and content..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {query.length < 2 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Type at least 2 characters to search...
          </div>
        ) : isLoading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        ) : !hasResults ? (
          <CommandEmpty>No results found for "{query}"</CommandEmpty>
        ) : (
          <>
            {results?.projects && results.projects.length > 0 && (
              <CommandGroup heading="Projects">
                {results.projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={`project-${project.slug}`}
                    onSelect={() => handleSelect(project.slug)}
                    className="cursor-pointer"
                  >
                    <FolderOpen className="mr-2 h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {highlightMatches(project.title, query)}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {highlightMatches(
                          getMatchSnippet(project.description, query, 40),
                          query
                        )}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results?.blocks && results.blocks.length > 0 && (
              <CommandGroup heading="Content">
                {results.blocks.map((block) => (
                  <CommandItem
                    key={block.id}
                    value={`block-${block.id}`}
                    onSelect={() =>
                      block.project_slug && handleSelect(block.project_slug)
                    }
                    className="cursor-pointer"
                  >
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs text-primary">
                        {block.project_title || "Unknown Project"}
                      </span>
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {highlightMatches(
                          getMatchSnippet(block.content, query, 50),
                          query
                        )}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default SearchCommand;
