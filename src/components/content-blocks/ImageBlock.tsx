interface ImageBlockProps {
  src: string;
  alt: string;
  caption?: string;
}

const ImageBlock = ({ src, alt, caption }: ImageBlockProps) => {
  return (
    <figure className="my-6">
      <div className="rounded-lg overflow-hidden border border-border">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto"
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export default ImageBlock;
