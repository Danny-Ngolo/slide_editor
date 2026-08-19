"use client";

const VALID_VIDEO_ID = /^[A-Za-z0-9_-]{6,20}$/;

const YoutubeBlockRenderer = ({ block }) => {
  const content = block?.content || {};
  const { videoId, startTime, caption } = content;

  if (!videoId || !VALID_VIDEO_ID.test(videoId)) {
    return (
      <div className="presentation-video-missing" role="note">
        This video is not available.
      </div>
    );
  }

  const src = `https://www.youtube.com/embed/${videoId}${
    startTime ? `?start=${startTime}` : ""
  }`;

  return (
    <figure>
      <div className="presentation-video">
        <iframe
          className="presentation-video-frame"
          src={src}
          title="Embedded video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {caption ? (
        <figcaption className="presentation-video-caption">{caption}</figcaption>
      ) : null}
    </figure>
  );
};

export default YoutubeBlockRenderer;