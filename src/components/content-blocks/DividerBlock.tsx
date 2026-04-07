interface DividerBlockProps {
  style?: "solid" | "dashed" | "dotted";
}

const STYLES: Record<string, string> = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
};

const DividerBlock = ({ style = "solid" }: DividerBlockProps) => {
  return (
    <hr
      className={`border-t border-border ${STYLES[style] || STYLES.solid} my-4`}
    />
  );
};

export default DividerBlock;
