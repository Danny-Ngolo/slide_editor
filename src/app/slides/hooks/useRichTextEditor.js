import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef } from "react";
import { useEditorContext } from "../components/EditorContext";
import { useSlides } from "./useSlides";
import { useSlashMenu } from "./useSlashMenu";
import { useTable } from "./useTable";

export function useRichTextEditor() {
  const {
    setEditorState,
    setActiveEditor,
    activeEditorRef,
    setShowSlashMenu,
    setSlashQuery,
    setSlashRange,
    setSelectedBlockIndex,
    setSlashMenuPosition,
    filteredItems,
    selectedBlockIndex,

    setTableSelection,
  } = useEditorContext();
  const { handleSlashSelect } = useSlashMenu();
  const { updateBlock } = useSlides();

  const { focusAdjacentCell } = useTable();

  const getEditorState = useCallback((editor) => {
    if (!editor) return {};

    const textAlignCenter = editor.isActive({ textAlign: "center" });
    const textAlignRight = editor.isActive({ textAlign: "right" });

    return {
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
      code: editor.isActive("code"),
      subscript: editor.isActive("subscript"),
      superscript: editor.isActive("superscript"),
      heading1: editor.isActive("heading", { level: 1 }),
      heading2: editor.isActive("heading", { level: 2 }),
      heading3: editor.isActive("heading", { level: 3 }),
      paragraph: editor.isActive("paragraph"),
      blockquote: editor.isActive("blockquote"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      taskList: editor.isActive("taskList"),
      codeBlock: editor.isActive("codeBlock"),
      link: editor.isActive("link"),
      highlight: editor.isActive("highlight"),
      textAlignLeft: !textAlignCenter && !textAlignRight,
      textAlignCenter,
      textAlignRight,
    };
  }, []);

  const updateEditorState = useCallback(
    (editor) => {
      setEditorState(getEditorState(editor));
    },
    [getEditorState, setEditorState],
  );

  const handleTableKeyDown = ({ event, rows, rowIndex, columnIndex }) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        focusAdjacentCell({
          rows,
          rowIndex,
          columnIndex,
          direction: "left",
        });
        return true;

      case "ArrowRight":
        event.preventDefault();
        focusAdjacentCell({
          rows,
          rowIndex,
          columnIndex,
          direction: "right",
        });
        return true;

      case "ArrowUp":
        event.preventDefault();
        focusAdjacentCell({
          rows,
          rowIndex,
          columnIndex,
          direction: "up",
        });
        return true;

      case "ArrowDown":
        event.preventDefault();
        focusAdjacentCell({
          rows,
          rowIndex,
          columnIndex,
          direction: "down",
        });
        return true;

      case "Tab":
        event.preventDefault();

        focusAdjacentCell({
          rows,
          rowIndex,
          columnIndex,
          direction: event.shiftKey ? "left" : "right",
        });

        return true;

      case "Enter":
        event.preventDefault();

        focusAdjacentCell({
          rows,
          rowIndex,
          columnIndex,
          direction: event.shiftKey ? "up" : "down",
        });

        return true;

      case "Escape":
        event.preventDefault();

        setTableSelection({
          blockId: null,
          row: null,
          column: null,
          type: null,
        });

        return true;

      default:
        return false;
    }
  };

  const useInitEditor = ({
    slideId,
    blockId,
    blockType,
    content,
    onContentChange,
    rows,
    rowIndex,
    columnIndex,
  }) => {
    const contentRef = useRef(content);

    useEffect(() => {
      contentRef.current = content;
    }, [content]);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          link: {
            openOnClick: false,
            autolink: true,
            HTMLAttributes: {
              rel: "noopener noreferrer",
              target: "_blank",
            },
          },
        }),
        Highlight,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Subscript,
        Superscript,
        TaskList,
        TaskItem,
      ],
      immediatelyRender: false,
      content: content?.html || "",
      onFocus({ editor }) {
        activeEditorRef.current = editor.view.dom;
        setActiveEditor(editor);

        updateEditorState(editor);
      },
      onUpdate({ editor }) {
        if (!editor) return;

        // check firts if the pressed key matchs / to show the slashMenu, if not: update the

        const text = editor.getText();
        const selection = editor.state.selection;

        if (!text.includes("/")) {
          setShowSlashMenu(false);
        }

        const lastChar = text?.slice(-1);

        if (lastChar === "/") {
          setShowSlashMenu(true);
          setSlashQuery("");
        }

        const textBefore = editor.state.doc.textBetween(0, selection.from, " ");

        const matchQuery = textBefore.match(/\/(\w*)$/);

        if (matchQuery) {
          const coords = editor.view.coordsAtPos(selection.from);

          if (matchQuery && matchQuery?.length) {
            const from = selection.from - matchQuery[0].length;

            setSlashRange({
              from,
              to: selection.from,
            });

            setSlashQuery(matchQuery[1]);
            setShowSlashMenu(true);
          }

          setSlashMenuPosition({
            top: coords.bottom + window.scrollY + 5,
            left: coords.left + window.scrollX,
          });

          setShowSlashMenu(true);
          setSelectedBlockIndex(0);
        }

        const newContent = {
          ...contentRef.current,
          html: editor.getHTML(),
        };

        // modify the cell if it's a table

        if (onContentChange) {
          onContentChange(newContent);
        } else {
          updateBlock(slideId, blockId, newContent, {
            recordHistory: false,
          });
        }
        updateEditorState(editor);
      },

      editorProps: {
        handleKeyDown(view, event) {
          if (event.key === "Enter") {
            const { state } = view;

            const textBefore = state.doc.textBetween(
              0,
              state.selection.from,
              " ",
            );

            const matchQuery = textBefore.match(/\/(\w*)$/);

            if (!matchQuery) {
              return false;
            } else {
              const selectedItem = filteredItems[selectedBlockIndex];

              if (selectedItem) {
                handleSlashSelect(
                  editor,
                  slideId,
                  selectedItem.type,
                  selectedItem.variant,
                );
              }
            }

            return true;
          }

          if (blockType === "table") {
            handleTableKeyDown({
              event,
              editor,
              rows,
              rowIndex,
              columnIndex,
            });
          }
        },
      },
    });

    return editor;
  };

  const updateEditorUI = useCallback((editor, content = {}) => {
    if (!editor) return;

    const blockHtml = content?.html;
    const currentHtml = editor.getHTML();

    if (blockHtml !== currentHtml) {
      editor.commands.setContent(content?.html);
    }
  }, []);

  return {
    getEditorState,
    updateEditorState,
    useInitEditor,
    updateEditorUI,
  };
}
