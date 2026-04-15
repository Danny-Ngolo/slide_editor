"use client";

import React, { useEffect, useRef, useState } from "react";

const ImageBlock = ({ block, slideId, updateBlock }) => {
  const [image, setImage] = useState(block.content || "");
  const [imageWidth, setImageWith] = useState(block.with || 300);
  const isResizing = useRef(false);
  const imageRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    setImage(url);
    updateBlock(slideId, block.id, url);
  };

  const handleMouseDown = () => {
    isResizing.current = true;
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;

    const newWidth =
      e.clientX - e.target.parentElement.getBoundingClientRect().left;

    console.log("newWidth", newWidth);
    setImageWith(newWidth);
  };

  const handleMouseUp = (e) => {
    if (isResizing.current) {
      isResizing.current = false;

      updateBlock(slideId, block.id, {
        ...block.content,
        width: imageWidth,
      });
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [imageWidth]);

  return (
    <div style={{ margin: "10px 0" }}>
      {!image && (
        <div>
          <button
            onClick={() => imageRef.current.click()}
            style={{ padding: "8px 12px", borderRadius: "4px", border: "none" }}
          >
            Upload Image
          </button>
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      )}
      {image && (
        <div style={{ position: "relative", width: imageWidth }}>
          <img
            src={image}
            alt="uploaded"
            style={{ maxWidth: "100%", borderRadius: "8px" }}
          />

          {/* Resize handler */}
          <div
            onMouseDown={handleMouseDown}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "12px",
              height: "12px",
              background: "#333",
              border: "2px solid #eee",
              cursor: "nwse-resize",
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default ImageBlock;
