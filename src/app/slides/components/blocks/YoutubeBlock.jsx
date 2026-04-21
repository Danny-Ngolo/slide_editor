"use client";

import React, { useState } from "react";

const YoutubeBlock = ({ slideId, block, updateBlock }) => {
  const [url, setUrl] = useState(block.content?.url || "");
  const [videoId, setVideoId] = useState(block.content?.videoId || "");
  const [startTime, setStartTime] = useState(block.startTime || "");
  const [caption, setCaption] = useState(block.content.caption || "");

  const extractVideoId = (url) => {
    const regExp =
      /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/]+)/;

    const match = url?.match(regExp);

    return match ? match[1] : null;
  };

  const extractStartTime = (url) => {
    const match = url.match(/[?&]t=(\d+)/);
    return match ? match[1] : null;
  };

  const handlePaste = (e) => {
    const pastedUrl = e.clipboardData.getData("text");
    console.log("pasted", pastedUrl);

    const id = extractVideoId(pastedUrl);
    const start = extractStartTime(pastedUrl);

    if (!id) {
      alert("Invalid YouTube Link");
      return;
    }

    setVideoId(id);
    if (start) setStartTime(start);

    updateBlock(slideId, block.id, {
      url: pastedUrl,
      videoId: id,
      startTime: start ? start : "",
    });
  };

  return (
    <div style={{ margin: "10px 0" }}>
      {!videoId && (
        <div>
          <input
            type="text"
            placeholder="Paste YouTube Link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPaste={handlePaste}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
      )}

      {videoId && (
        <div>
          <div style={{ position: "relative", paddingTop: "56.25%" }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}${startTime ? `?start=${startTime}` : ""}`}
              title="YouTube Video"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            ></iframe>
          </div>
          <div style={{ marginTop: "15px" }}>
            <input
              type="text"
              placeholder="Add caption"
              value={caption}
              onChange={(e) => {
                setCaption(e.target.value);

                updateBlock(slideId, block.id, {
                  ...block.content,
                  caption: e.target.value,
                });
              }}
              style={{ width: "100%", padding: "8px" }}
            />
            <button onClick={() => setVideoId("")}>Replace Video</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default YoutubeBlock;
