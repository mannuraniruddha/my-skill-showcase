import * as React from "react";
import { cn } from "@/lib/utils";

export interface CodeTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  indentSize?: number;
}

const CodeTextarea = React.forwardRef<HTMLTextAreaElement, CodeTextareaProps>(
  ({ className, value, onChange, indentSize = 4, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const indent = " ".repeat(indentSize);

        if (e.shiftKey) {
          // Outdent: remove leading spaces from current line
          const beforeCursor = value.substring(0, start);
          const afterCursor = value.substring(end);
          const lineStart = beforeCursor.lastIndexOf("\n") + 1;
          const lineContent = value.substring(lineStart, start);
          
          // Check if line starts with spaces we can remove
          const spacesToRemove = Math.min(
            indentSize,
            lineContent.length - lineContent.trimStart().length
          );
          
          if (spacesToRemove > 0) {
            const newValue =
              value.substring(0, lineStart) +
              value.substring(lineStart + spacesToRemove);
            onChange(newValue);
            
            requestAnimationFrame(() => {
              if (textareaRef.current) {
                const newPos = Math.max(lineStart, start - spacesToRemove);
                textareaRef.current.selectionStart = newPos;
                textareaRef.current.selectionEnd = newPos;
              }
            });
          }
        } else {
          // Indent: insert spaces at cursor
          const newValue =
            value.substring(0, start) + indent + value.substring(end);
          onChange(newValue);

          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = start + indentSize;
              textareaRef.current.selectionEnd = start + indentSize;
            }
          });
        }
      }
    };

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    return (
      <textarea
        ref={setRefs}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono",
          className
        )}
        {...props}
      />
    );
  }
);
CodeTextarea.displayName = "CodeTextarea";

export { CodeTextarea };
