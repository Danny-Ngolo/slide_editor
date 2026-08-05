"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent } from "@tiptap/react";
import { ArrowDown, ArrowUp, Link, Plus, Trash, Upload, X } from "lucide-react";
import EditableTitle from "../EditableTitle";
import InsertMenu from "../InsertMenu";
import { useEditorContext } from "../EditorContext";
import {
  blocks_groups,
  filterBlocks,
  flattenBlocks,
} from "../../editor/blocks";
import { useExercise } from "../../hooks/useExercise";
import { useRichTextEditor } from "../../hooks/useRichTextEditor";
import { useSlashMenu } from "../../hooks/useSlashMenu";
import {
  RESOURCE_TYPES,
  withDefaults,
} from "../../hooks/exerciseUtils";

const COLORS = {
  card: "#ffffff",
  text: "#1f2328",
  label: "#374151",
  fieldBg: "#f6f8fa",
  fieldBorder: "#d0d7de",
  inputBg: "#ffffff",
  border: "#e2e5ea",
  placeholder: "#6b7280",
};

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const LABEL_STYLE = {
  fontSize: "11px",
  fontWeight: "bold",
  color: COLORS.label,
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  marginBottom: "6px",
};

const INPUT_STYLE = {
  padding: "4px 6px",
  border: `1px solid ${COLORS.fieldBorder}`,
  borderRadius: "4px",
  background: COLORS.inputBg,
  color: COLORS.text,
};

const EditorBox = ({ children }) => (
  <div
    style={{
      border: `1px solid ${COLORS.fieldBorder}`,
      borderRadius: "6px",
      padding: "4px 8px",
      minHeight: "60px",
      background: COLORS.fieldBg,
      color: COLORS.text,
    }}
  >
    {children}
  </div>
);

const RichTextField = ({ field, block, slideId, onUpdateField }) => {
  const {
    showSlashMenu,
    setShowSlashMenu,
    slashQuery,
    slashRange,
    selectedBlockIndex,
    slashMenuPosition,
    filteredItems,
    setFilteredItems,
  } = useEditorContext();
  const { updateEditorState, useInitEditor, updateEditorUI } =
    useRichTextEditor();
  const { handleDirectionKey, handleSlashSelect } = useSlashMenu();

  const closeSlashMenu = useCallback(
    () => setShowSlashMenu(false),
    [setShowSlashMenu],
  );

  const fieldContent = useMemo(
    () => withDefaults(block.content)[field] || { html: "" },
    [block.content, field],
  );

  const editor = useInitEditor({
    slideId,
    blockId: block.id,
    blockType: "exercise",
    content: fieldContent,
    onContentChange: (newContent) =>
      onUpdateField(field, { html: newContent.html }),
  });

  useEffect(() => {
    if (!editor) return;
    const editorHandler = () => updateEditorState(editor);
    editor.on("selectionUpdate", editorHandler);
    return () => {
      editor.off("selectionUpdate", editorHandler);
    };
  }, [editor, updateEditorState]);

  useEffect(() => {
    updateEditorUI(editor, fieldContent);
  }, [editor, fieldContent, updateEditorUI]);

  useEffect(() => {
    const filteredBlocks = filterBlocks(blocks_groups, slashQuery);
    const filtered = flattenBlocks(filteredBlocks);
    setFilteredItems(filtered);
  }, [showSlashMenu, slashQuery, setFilteredItems]);

  useEffect(() => {
    document.addEventListener("keydown", handleDirectionKey);
    return () => {
      document.removeEventListener("keydown", handleDirectionKey);
    };
  }, [showSlashMenu, filteredItems, selectedBlockIndex, handleDirectionKey]);

  if (!editor) return null;

  return (
    <EditorBox>
      <EditorContent editor={editor} />
      {showSlashMenu && slashMenuPosition && (
        <InsertMenu
          onSelect={(type, variant = undefined) => {
            handleSlashSelect(editor, slideId, slashRange, type, variant);
          }}
          onClose={closeSlashMenu}
        />
      )}
    </EditorBox>
  );
};

const Accordion = ({ label, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: "16px" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          ...LABEL_STYLE,
          marginBottom: 0,
        }}
      >
        <span>{open ? "▾" : "▸"}</span>
        {label}
      </button>
      {open && <div style={{ marginTop: "6px" }}>{children}</div>}
    </div>
  );
};

const TimeInput = ({ value, onChange }) => {
  const commit = (e) => {
    const next = e.target.value === "" ? null : Number(e.target.value);
    if ((value ?? null) !== next) onChange(next);
  };

  return (
    <input
      type="number"
      min="0"
      placeholder="--"
      defaultValue={value ?? ""}
      onBlur={commit}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      style={{ ...INPUT_STYLE, width: "70px" }}
    />
  );
};

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

const rowButtonStyle = (disabled) => ({
  display: "flex",
  alignItems: "center",
  background: "transparent",
  border: "none",
  cursor: disabled ? "default" : "pointer",
  color: disabled ? COLORS.placeholder : COLORS.label,
  padding: "2px",
  borderRadius: "4px",
  flexShrink: 0,
});

const ResourceSection = ({ block, slideId }) => {
  const content = withDefaults(block.content);
  const { addResource, removeResource, updateResource, moveResource } =
    useExercise({ slideId, blockId: block.id });
  const fileInputRef = useRef(null);
  const [addType, setAddType] = useState(null);
  const [draftUrl, setDraftUrl] = useState("");

  const stop = (e) => e.stopPropagation();

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

  const resources = content.resources;

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
            onRename={(title) =>
              updateResource(resource.id, { title })
            }
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

const addButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  padding: "4px 10px",
  border: `1px solid ${COLORS.fieldBorder}`,
  borderRadius: "4px",
  background: COLORS.inputBg,
  color: COLORS.text,
  fontSize: "12px",
  cursor: "pointer",
};

const ExerciseBlock = ({ block, slideId }) => {
  const content = withDefaults(block.content);
  const { updateField } = useExercise({ slideId, blockId: block.id });

  return (
    <div
      style={{
        background: COLORS.card,
        color: COLORS.text,
        padding: "12px 14px",
        borderRadius: "8px",
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <EditableTitle
        value={content.title}
        onChange={(title) =>
          updateField("title", title, { recordHistory: true })
        }
        style={{
          fontSize: "1.25em",
          fontWeight: "bold",
          color: COLORS.text,
          marginBottom: "4px",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginTop: "12px",
          fontSize: "13px",
          color: COLORS.text,
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          Difficulty
          <select
            value={content.difficulty}
            onChange={(e) =>
              updateField("difficulty", e.target.value, {
                recordHistory: true,
              })
            }
            style={INPUT_STYLE}
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          Time (min)
          <TimeInput
            value={content.estimatedTime}
            onChange={(v) =>
              updateField("estimatedTime", v, { recordHistory: true })
            }
          />
        </label>
      </div>

      <div style={{ marginTop: "16px" }}>
        <div style={LABEL_STYLE}>Instructions</div>
        <RichTextField
          field="instructions"
          block={block}
          slideId={slideId}
          onUpdateField={updateField}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <ResourceSection block={block} slideId={slideId} />
      </div>

      <Accordion label="Hint">
        <RichTextField
          field="hint"
          block={block}
          slideId={slideId}
          onUpdateField={updateField}
        />
      </Accordion>

      <Accordion label="Teacher notes">
        <RichTextField
          field="teacherNotes"
          block={block}
          slideId={slideId}
          onUpdateField={updateField}
        />
      </Accordion>
    </div>
  );
};

export default ExerciseBlock;