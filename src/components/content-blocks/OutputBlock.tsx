import { Terminal } from "lucide-react";

interface OutputBlockProps {
  content: string;
  label?: string;
}

const OutputBlock = ({ content, label = "Output" }: OutputBlockProps) => {
  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <div className="bg-secondary px-4 py-2 text-sm font-mono text-muted-foreground border-b border-border flex items-center gap-2">
        <Terminal className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <pre className="bg-card p-4 font-mono text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">
        {content}
      </pre>
    </div>
  );
};

export default OutputBlock;
