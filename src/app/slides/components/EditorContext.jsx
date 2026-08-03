import React, {
  createContext,
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

  const [recordedActiveSlideId, setRecordedActiveSlideId] = useState(null);

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

  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashMenuPosition, setSlashMenuPosition] = useState({
    top: "20px",
    left: "20px",
  });
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(0);
  const [slashRange, setSlashRange] = useState(null);
  const isUndoRedo = useRef(false);

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

  const [tableMenu, setTableMenu] = useState(null);

  const tableMenuRef = useRef(null);

  const [tableResizeState, setTableResizeState] = useState(null);

  const cellEditors = useRef({});

  const registerEditor = (cellId, editor) => {
    if (!cellId || !editor) return;

    cellEditors.current[cellId] = editor;
  };

  const unregisterEditor = (cellId) => {
    delete cellEditors.current[cellId];
  };

  const focusEditor = (cellId) => {
    cellEditors.current[cellId]?.commands?.focus();
  };

  // TRIAL **********
  useEffect(() => {
    console.log('selectedCells', selectedCells)
  }, [selectedCells])

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
        recordedActiveSlideId,
        setRecordedActiveSlideId,
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
        activeEditorRef,
        editorToolBarRef,
        isUndoRedo,
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

        tableMenu,
        setTableMenu,
        tableMenuRef,

        tableResizeState,
        setTableResizeState,

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
