"use client";

import React, { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Link,
  Plus,
  Trash,
  Upload,
  X,
} from "lucide-react";
import EditableTitle from "../../EditableTitle";
import { RESOURCE_TYPES } from "../../../hooks/resourceUtils";
import { useResources } from "../../../hooks/useResources";
import {
  COLORS,
  LABEL_STYLE,
  addButtonStyle,
  rowButtonStyle,
} from "./styles";

const ResourceItem = ({
  resource,
  onRename,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  const { type, title, src } = resource;
  const Icon = RESOURCE_TYPES[type]?.icon || Link;

  const stop = (e) => e.stopPropagation();

  return (
    <div
      onClick={stop}
      onMouseDown={stop}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 8px",
        border: `1px solid ${COLORS.fieldBorder}`,
        borderRadius: "6px",
        background: COLORS.fieldBg,
        fontSize: "13px",
        color: COLORS.text,
      }}
    >
      <Icon size={16} color={COLORS.label} />

      {type === "image" ? (
        <img
          src={src}
          alt={title}
          style={{
            width: "36px",
            height: "36px",
            objectFit: "cover",
            borderRadius: "4px",
            flexShrink: 0,
          }}
        />
      ) : (
        <span
          style={{
            maxWidth: "160px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: COLORS.placeholder,
            flexShrink: 0,
          }}
          title={src}
        >
          {src}
        </span>
      )}

      <EditableTitle
        value={title}
        onChange={onRename}
        style={{ fontSize: "13px", color: COLORS.text, flex: 1 }}
      />

      <button
        type="button"
        onClick={(e) => {
          stop(e);
          onMoveUp();
        }}
        disabled={isFirst}
        title="Move up"
        style={rowButtonStyle(isFirst)}
      >
        <ArrowUp size={14} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          onMoveDown();
        }}
        disabled={isLast}
        title="Move down"
        style={rowButtonStyle(isLast)}
      >
        <ArrowDown size={14} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          onRemove();
        }}
        title="Remove resource"
        style={rowButtonStyle(false)}
      >
        <Trash size={14} />
      </button>
    </div>
  );
};

const ResourceSection = ({ block, slideId }) => {
  const { addResource, removeResource, updateResource, moveResource } =
    useResources({ slideId, blockId: block.id });
  const fileInputRef = useRef(null);
  const [addType, setAddType] = useState(null);
  const [draftUrl, setDraftUrl] = useState("");

  const stop = (e) => e.stopPropagation();

  const resources = Array.isArray(block.content?.resources)
    ? block.content.resources
    : [];

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const type = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : "file";

    addResource(type, {
      src: URL.createObjectURL(file),
      title: file.name,
      mimeType: file.type || null,
      size: file.size,
    });
    e.target.value = "";
  };

  const handleDrop = (e) => {
    stop(e);
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const type = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : "file";

    addResource(type, {
      src: URL.createObjectURL(file),
      title: file.name,
      mimeType: file.type || null,
      size: file.size,
    });
  };

  const submitUrl = () => {
    const src = draftUrl.trim();
    if (!src) return;

    addResource(addType, { src, title: src });
    setDraftUrl("");
    setAddType(null);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={LABEL_STYLE}>Resources</div>
        <span style={{ ...LABEL_STYLE, color: COLORS.placeholder }}>
          ({resources.length})
        </span>
      </div>

      <div
        onClick={stop}
        onMouseDown={stop}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={handleDrop}
        style={{
          marginTop: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {resources.map((resource, index) => (
          <ResourceItem
            key={resource.id}
            resource={resource}
            isFirst={index === 0}
            isLast={index === resources.length - 1}
            onRename={(title) => updateResource(resource.id, { title })}
            onRemove={() => removeResource(resource.id)}
            onMoveUp={() => moveResource(resource.id, -1)}
            onMoveDown={() => moveResource(resource.id, 1)}
          />
        ))}
      </div>

      {resources.length === 0 && !addType && (
        <div
          onClick={stop}
          style={{
            border: `1px dashed ${COLORS.fieldBorder}`,
            borderRadius: "6px",
            padding: "16px",
            color: COLORS.placeholder,
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          No resources yet.
        </div>
      )}

      {!addType && (
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              fileInputRef.current?.click();
            }}
            style={addButtonStyle}
          >
            <Upload size={14} /> File
          </button>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              setAddType("url");
            }}
            style={addButtonStyle}
          >
            <Link size={14} /> URL
          </button>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              setAddType("video");
            }}
            style={addButtonStyle}
          >
            <Plus size={14} /> Video
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="*/*"
            onChange={handleFile}
            style={{ display: "none" }}
          />
        </div>
      )}

      {addType && (
        <div
          onClick={stop}
          onMouseDown={stop}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "8px",
            padding: "6px",
            border: `1px solid ${COLORS.fieldBorder}`,
            borderRadius: "6px",
            background: COLORS.fieldBg,
          }}
        >
          <input
            type="text"
            autoFocus
            value={draftUrl}
            placeholder={
              addType === "video"
                ? "Paste a video URL (YouTube, etc.)"
                : "Paste a URL"
            }
            onChange={(e) => setDraftUrl(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") submitUrl();
              if (e.key === "Escape") setAddType(null);
            }}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "13px",
              color: COLORS.text,
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              submitUrl();
            }}
            style={addButtonStyle}
          >
            Add
          </button>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              setAddType(null);
            }}
            style={rowButtonStyle(false)}
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ResourceSection;