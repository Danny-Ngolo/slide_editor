"use client";

const ImageBlockRenderer = ({ block }) => {
  const content = block?.content || {};
  const { image, caption, width } = content;

  if (!image) {
    return (
      <div className="presentation-image-missing" role="note">
        This image is not available.
      </div>
    );
  }

  const align =
    content.align === "left" || content.align === "right"
      ? content.align
      : "center";

  return (
    <figure className={`presentation-image presentation-image-align-${align}`}>
      <img
        className="presentation-image-img"
        src={image}
        alt={caption || ""}
        style={width ? { width } : undefined}
      />

      {caption ? (
        <figcaption className="presentation-image-caption">{caption}</figcaption>
      ) : null}
    </figure>
  );
};

export default ImageBlockRenderer;