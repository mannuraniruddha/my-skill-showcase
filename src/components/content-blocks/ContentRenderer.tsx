import { type ContentBlock } from "@/hooks/useContentBlocks";
import TabbedCodeBlock from "./TabbedCodeBlock";
import MarkdownBlock from "./MarkdownBlock";
import OutputBlock from "./OutputBlock";
import ImageBlock from "./ImageBlock";
import SpacerBlock from "./SpacerBlock";
import DividerBlock from "./DividerBlock";

interface ContentRendererProps {
  blocks: ContentBlock[];
  searchQuery?: string;
}

const ContentRenderer = ({ blocks, searchQuery }: ContentRendererProps) => {
  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        switch (block.type) {
          case "code":
            return (
              <TabbedCodeBlock
                key={block.id}
                code={block.content}
                language={block.metadata?.language || "text"}
                filename={block.metadata?.filename}
                levels={block.metadata?.levels}
              />
            );
          case "markdown":
            return (
              <MarkdownBlock
                key={block.id}
                content={block.content}
                searchQuery={searchQuery}
              />
            );
          case "output":
            return (
              <OutputBlock
                key={block.id}
                content={block.content}
                label={block.metadata?.label}
              />
            );
          case "image":
            return (
              <ImageBlock
                key={block.id}
                src={block.content}
                alt={block.metadata?.alt || "Image"}
                caption={block.metadata?.caption}
              />
            );
          case "text":
            return (
              <p key={block.id} className="text-foreground leading-relaxed">
                {block.content}
              </p>
            );
          case "spacer":
            return (
              <SpacerBlock
                key={block.id}
                height={block.metadata?.height || "medium"}
              />
            );
          case "divider":
            return (
              <DividerBlock
                key={block.id}
                style={block.metadata?.style || "solid"}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default ContentRenderer;
