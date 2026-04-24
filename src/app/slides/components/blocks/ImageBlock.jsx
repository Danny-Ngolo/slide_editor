"use client";

import React, { useEffect, useRef, useState } from "react";

const ImageBlock = ({ block, slideId, updateBlock }) => {
  const [image, setImage] = useState(block.content.image || "");
  const [imageWidth, setImageWith] = useState(block.with || 300);
  const [caption, setCaption] = useState(block.caption || "");
  const [align, setAlign] = useState("center");
  const isResizing = useRef(false);
  const imageRef = useRef(null);
  const imageContainerRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;
    addImageFile(file);
  };

  const handleMouseDown = () => {
    isResizing.current = true;
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;

    const rect = e.target.parentElement.getBoundingClientRect();

    const newWidth = e.clientX - rect.left;

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

  const handleDrop = (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (!file) return;
    addImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const updateAlign = (value) => {
    setAlign(value);

    updateBlock(slideId, block.id, {
      ...block.content,
      align: value,
    });
  };

  function addImageFile(file) {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImage(url);
    updateBlock(slideId, block.id, { ...block, image: url });
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [imageWidth]);

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        margin: "10px 0",
        border: image ? "none" : "2px dashed #ccc",
        padding: "10px",
        borderRadius: "8px",
      }}
    >
      {!image && (
        <div>
          <button
            onClick={() => imageRef.current.click()}
            style={{ padding: "8px 12px", borderRadius: "4px", border: "none" }}
          >
            Drop the Image down or click to upload
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
        <div
          style={{
            display: "flex",
            justifyContent:
              align === "left"
                ? "flex-start"
                : align === "right"
                  ? "flex-end"
                  : "center",
          }}
        >
          <div
            ref={imageContainerRef}
            style={{
              position: "relative",
              width: imageWidth,
            }}
          >
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

            {/* Add caption to the image */}
            <input
              type="text"
              value={caption}
              placeholder="Add caption"
              onChange={(e) => {
                setCaption(e.target.value);

                updateBlock(slideId, block.id, {
                  ...block.content,
                  caption: e.target.value,
                });
              }}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "14px",
                marginTop: "6px",
                color: "#ccc",
                padding: "8px",
                background: "transparent",
              }}
            />
          </div>
        </div>
      )}

      {/* Align the image on the page */}

      {image && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <button
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              border: "none",
            }}
            onClick={() => updateAlign("left")}
          >
            Left
          </button>
          <button
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              border: "none",
            }}
            onClick={() => updateAlign("center")}
          >
            Center
          </button>
          <button
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              border: "none",
            }}
            onClick={() => updateAlign("right")}
          >
            Right
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageBlock;
