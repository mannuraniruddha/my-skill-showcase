import React from "react";

/**
 * Escapes special regex characters in a string
 */
const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Highlights matching text by wrapping matches in <mark> tags
 */
export const highlightMatches = (
  text: string,
  query: string
): React.ReactNode => {
  if (!query || query.length < 2) {
    return text;
  }

  // Split query into words and escape each
  const words = query
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .map(escapeRegex);

  if (words.length === 0) {
    return text;
  }

  // Create regex that matches any of the words
  const regex = new RegExp(`(${words.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark
        key={index}
        className="bg-primary/30 text-foreground px-0.5 rounded-sm"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
};

/**
 * Get a snippet of text around the first match
 */
export const getMatchSnippet = (
  text: string,
  query: string,
  contextLength: number = 60
): string => {
  if (!query || query.length < 2) {
    return text.slice(0, contextLength * 2);
  }

  const words = query.trim().split(/\s+/).filter(Boolean);
  const lowerText = text.toLowerCase();

  for (const word of words) {
    const index = lowerText.indexOf(word.toLowerCase());
    if (index !== -1) {
      const start = Math.max(0, index - contextLength);
      const end = Math.min(text.length, index + word.length + contextLength);
      const prefix = start > 0 ? "..." : "";
      const suffix = end < text.length ? "..." : "";
      return prefix + text.slice(start, end) + suffix;
    }
  }

  return text.slice(0, contextLength * 2) + (text.length > contextLength * 2 ? "..." : "");
};
