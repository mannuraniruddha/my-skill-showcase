import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
}

const CodeBlock = ({ code, language, filename }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-border">
      {filename && (
        <div className="bg-secondary px-4 py-2 text-sm font-mono text-muted-foreground border-b border-border flex items-center justify-between">
          <span>{filename}</span>
          <span className="text-xs uppercase">{language}</span>
        </div>
      )}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 hover:bg-background"
          onClick={handleCopy}
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
            borderRadius: filename ? 0 : "0.5rem",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
