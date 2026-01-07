import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface CodeLevels {
  beginner?: string;
  intermediate?: string;
  expert?: string;
}

interface TabbedCodeBlockProps {
  code: string; // Fallback for legacy single code
  language: string;
  filename?: string;
  levels?: CodeLevels;
}

const LEVEL_LABELS = {
  beginner: { label: "Beginner", color: "bg-green-500/20 text-green-400" },
  intermediate: { label: "Intermediate", color: "bg-yellow-500/20 text-yellow-400" },
  expert: { label: "Expert", color: "bg-red-500/20 text-red-400" },
};

const TabbedCodeBlock = ({
  code,
  language,
  filename,
  levels,
}: TabbedCodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("beginner");

  // Determine which levels have content
  const availableLevels = levels
    ? (Object.entries(levels) as [keyof CodeLevels, string | undefined][])
        .filter(([, value]) => value && value.trim().length > 0)
        .map(([key]) => key)
    : [];

  // If no levels or only legacy content, render simple code block
  const hasMultipleLevels = availableLevels.length > 1;
  const singleLevelCode =
    availableLevels.length === 1 ? levels?.[availableLevels[0]] : code;

  const handleCopy = async (codeToCopy: string) => {
    await navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCurrentCode = () => {
    if (!hasMultipleLevels) {
      return singleLevelCode || code;
    }
    return levels?.[activeTab as keyof CodeLevels] || code;
  };

  const CodeDisplay = ({ codeContent }: { codeContent: string }) => (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 hover:bg-background"
        onClick={() => handleCopy(codeContent)}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.875rem",
          borderRadius: 0,
        }}
      >
        {codeContent}
      </SyntaxHighlighter>
    </div>
  );

  // Simple code block for single level or legacy
  if (!hasMultipleLevels) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-border">
        {filename && (
          <div className="bg-secondary px-4 py-2 text-sm font-mono text-muted-foreground border-b border-border flex items-center justify-between">
            <span>{filename}</span>
            <div className="flex items-center gap-2">
              {availableLevels.length === 1 && (
                <Badge
                  variant="secondary"
                  className={LEVEL_LABELS[availableLevels[0]].color}
                >
                  {LEVEL_LABELS[availableLevels[0]].label}
                </Badge>
              )}
              <span className="text-xs uppercase">{language}</span>
            </div>
          </div>
        )}
        <CodeDisplay codeContent={getCurrentCode()} />
      </div>
    );
  }

  // Tabbed code block for multiple levels
  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {filename && (
        <div className="bg-secondary px-4 py-2 text-sm font-mono text-muted-foreground border-b border-border flex items-center justify-between">
          <span>{filename}</span>
          <span className="text-xs uppercase">{language}</span>
        </div>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-secondary/50 px-2 border-b border-border">
          <TabsList className="h-10 bg-transparent">
            {availableLevels.map((level) => (
              <TabsTrigger
                key={level}
                value={level}
                className="data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <span className={LEVEL_LABELS[level].color.split(" ")[1]}>
                  {LEVEL_LABELS[level].label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {availableLevels.map((level) => (
          <TabsContent key={level} value={level} className="m-0">
            <CodeDisplay codeContent={levels?.[level] || ""} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TabbedCodeBlock;
