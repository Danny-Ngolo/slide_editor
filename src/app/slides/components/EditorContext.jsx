import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const EditorContext = createContext();

const EditorProvider = ({ children }) => {
  const [slidesHistory, setSlidesHistory] = useState({
    past: [],
    present: [],
    future: [],
  });

  const [activeSlideId, setActiveSlideId] = useState(null);

  const [activeEditor, setActiveEditor] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState({
    slideId: null,
    blockId: null,
  });
  const [editorState, setEditorState] = useState({});
  const editorToolBarRef = useRef(null);
  const activeEditorRef = useRef(null);

  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [copiedBlocks, setCopiedBlocks] = useState([]);
  const [copiedBlock, setCopiedBlock] = useState(null);
  const [selectedSlides, setSelectedSlides] = useState([]);
  const [copiedSlides, setCopiedSlides] = useState([]);

  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashMenuPosition, setSlashMenuPosition] = useState({
    top: "20px",
    left: "20px",
  });
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(0);
  const [slashRange, setSlashRange] = useState(null);
  const isUndoRedoRef = useRef(false);

  const [filteredItems, setFilteredItems] = useState([]);

  const [tableSelection, setTableSelection] = useState({
    blockId: null,
    type: null,
    row: null,
    column: null,
  });
  // Set of selected cell IDs for multi‑cell operations
  const [selectedCells, setSelectedCells] = useState(new Set());

  // Shared drag-selection state (must live in context so all useTable() instances share it)
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionAnchor, setSelectionAnchor] = useState(null);
  // Becomes true only once a drag actually crosses into a second cell. Only
  // then do we lock text selection / pointer events. A plain click (focus) or
  // a drag that stays inside one cell keeps normal text selection/editing.
  const [cellDragActive, setCellDragActive] = useState(false);

  // Shared drag bookkeeping for table cell selection (must live in context: each
  // useTable()/useTableSelection() instance would otherwise own its own copy, so
  // the press cell, the dragged-over cells, and the release cell would disagree).
  const tableDragRef = useRef(null);

  const [tableMenu, setTableMenu] = useState(null);

  const tableMenuRef = useRef(null);

  // Registered by the active table block so the global paste handler can import
  // OS clipboard text (e.g. from Excel) as a cell grid.
  const tablePasteHandlerRef = useRef(null);

  const registerTablePasteHandler = useCallback((fn) => {
    tablePasteHandlerRef.current = fn;
  }, []);

  // Internal table clipboard — holds a snapshot of copied cells/rows/columns.
  // Single owner so copy/paste works across any component and keyboard handler.
  const [tableClipboard, setTableClipboard] = useState(null);

  const [tableResizeState, setTableResizeState] = useState(null);

  const cellEditors = useRef({});

  const registerEditor = useCallback((cellId, editor) => {
    if (!cellId || !editor) return;

    cellEditors.current[cellId] = editor;
  }, []);

  const unregisterEditor = useCallback((cellId) => {
    delete cellEditors.current[cellId];
  }, []);

  const focusEditor = useCallback((cellId) => {
    cellEditors.current[cellId]?.commands?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const insideEditor = activeEditorRef.current?.contains(e.target);
      const insideToolBar = editorToolBarRef.current?.contains(e.target);

      if (insideEditor || insideToolBar) {
        return;
      }

      setActiveEditor(null);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <EditorContext.Provider
      value={{
        activeSlideId,
        setActiveSlideId,
        activeEditor,
        setActiveEditor,
        editorState,
        setEditorState,
        slidesHistory,
        setSlidesHistory,
        selectedBlock,
        setSelectedBlock,
        selectedBlocks,
        setSelectedBlocks,
        selectedBlockIndex,
        setSelectedBlockIndex,
        copiedBlocks,
        setCopiedBlocks,
        copiedBlock,
        setCopiedBlock,
        selectedSlides,
        setSelectedSlides,
        copiedSlides,
        setCopiedSlides,
        activeEditorRef,
        editorToolBarRef,
        isUndoRedoRef,
        showSlashMenu,
        setShowSlashMenu,
        slashQuery,
        setSlashQuery,
        slashRange,
        setSlashRange,
        slashMenuPosition,
        setSlashMenuPosition,
        filteredItems,
        setFilteredItems,

        tableSelection,
        setTableSelection,
        selectedCells,
        setSelectedCells,

        isSelecting,
        setIsSelecting,
        selectionAnchor,
        setSelectionAnchor,
        cellDragActive,
        setCellDragActive,
        tableDragRef,

        tableMenu,
        setTableMenu,
        tableMenuRef,

        tablePasteHandlerRef,
        registerTablePasteHandler,

        tableResizeState,
        setTableResizeState,

        tableClipboard,
        setTableClipboard,

        registerEditor,
        unregisterEditor,
        focusEditor,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export function useEditorContext() {
  return useContext(EditorContext);
}

export default EditorProvider;
