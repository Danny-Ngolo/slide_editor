import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEditorContext } from "../components/EditorContext";
import { useSlides } from "./useSlides";
import { useSlashMenu } from "./useSlashMenu";

export function useRichTextEditor() {
  const {
    setEditorState,
    setActiveEditor,
    editorContainerRef,
    editorToolBarRef,
    setShowSlashMenu,
    setSlashQuery,
    setSlashRange,
    setSelectedBlockIndex,
    setSlashMenuPosition,
    filteredItems,
    selectedBlockIndex,
  } = useEditorContext();
  const { handleSlashSelect } = useSlashMenu();
  const { updateBlock } = useSlides();

  const getEditorState = (editor) => {
    if (!editor) return {};

    return {
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      heading1: editor.isActive("heading", { level: 1 }),
      heading2: editor.isActive("heading", { level: 2 }),
      heading3: editor.isActive("heading", { level: 3 }),
      blockquote: editor.isActive("blockquote"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      highlight: editor.isActive("highlight"),
      underline: editor.isActive("underline"),
    };
  };

  const updateEditorState = (editor) => {
    setEditorState(getEditorState(editor));
  };

  const initEditor = (slideId, blockId, blockContent) => {
    const editor = useEditor({
      extensions: [StarterKit, Underline, Highlight],
      immediatelyRender: false,
      content: blockContent?.html || "",
      onFocus({ editor }) {
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
          ...blockContent,
          html: editor.getHTML(),
        };

        updateBlock(slideId, blockId, newContent, { recordHistory: false });
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
        },
      },
    });

    return editor;
  };

  const updateEditorUI = (editor, blockContent = {}) => {
    if (!editor) return;

    const blockHtml = blockContent?.html;
    const currentHtml = editor.getHTML();

    if (blockHtml !== currentHtml) {
      editor.commands.setContent(blockContent?.html);
    }
  };

  const handleClickOutside = (e) => {
    const insideEditor = editorContainerRef.current?.contains(e.target);
    const insideToolbar = editorToolBarRef.current?.contains(e.target);

    if (insideEditor || insideToolbar) {
      return;
    }

    setActiveEditor(null);
  };

  return {
    getEditorState,
    updateEditorState,
    initEditor,
    updateEditorUI,
    handleClickOutside,
  };
}
