import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";
import { highlightMatches } from "@/lib/highlight";

interface MarkdownBlockProps {
  content: string;
  searchQuery?: string;
}

const MarkdownBlock = ({ content, searchQuery }: MarkdownBlockProps) => {
  // Detect if content is HTML (from TipTap) or Markdown
  const isHtml = content.startsWith("<") && content.includes("</");

  if (isHtml) {
    // Sanitize HTML to prevent XSS
    const sanitizedHtml = DOMPurify.sanitize(content, {
      ADD_TAGS: ["mark"],
      ADD_ATTR: ["class", "style"],
    });

    return (
      <div
        className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  // Fallback to ReactMarkdown for legacy Markdown content
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mb-4 text-foreground">
              {searchQuery ? highlightMatches(String(children), searchQuery) : children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mb-3 mt-8 text-foreground">
              {searchQuery ? highlightMatches(String(children), searchQuery) : children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mb-2 mt-6 text-foreground">
              {searchQuery ? highlightMatches(String(children), searchQuery) : children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-muted-foreground leading-relaxed">
              {searchQuery ? highlightMatches(String(children), searchQuery) : children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 text-muted-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownBlock;
