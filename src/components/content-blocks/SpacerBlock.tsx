interface SpacerBlockProps {
  height?: "small" | "medium" | "large" | "xl";
}

const HEIGHTS: Record<string, string> = {
  small: "h-4",   // 16px
  medium: "h-8",  // 32px
  large: "h-12",  // 48px
  xl: "h-16",     // 64px
};

const SpacerBlock = ({ height = "medium" }: SpacerBlockProps) => {
  return <div className={HEIGHTS[height] || HEIGHTS.medium} aria-hidden="true" />;
};

export default SpacerBlock;
