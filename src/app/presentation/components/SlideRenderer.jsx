import BlockRouter from "./BlockRouter";

const SlideRenderer = ({ slide }) => {
  const blocks = Array.isArray(slide?.blocks) ? slide.blocks : [];

  return (
    <article className="presentation-slide">
      <h1 className="presentation-slide-title">
        {slide?.title || "Untitled Slide"}
      </h1>

      {blocks.length === 0 ? (
        <p className="presentation-empty">This slide has no content.</p>
      ) : (
        blocks.map((block) => <BlockRouter key={block?.id} block={block} />)
      )}
    </article>
  );
};

export default SlideRenderer;