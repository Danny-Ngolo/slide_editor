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

  const handleClickOutside = (e) => {
    const insideEditor = activeEditorRef.current?.contains(e.target);
    const insideToolBar = editorToolBarRef.current?.contains(e.target);

    if (insideEditor || insideToolBar) {
      return;
    }

    setActiveEditor(null);
  };

  useEffect(() => {
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
        selectedBlockIndex,
        setSelectedBlockIndex,
        slashMenuPosition,
        setSlashMenuPosition,
        activeEditorRef,
        editorToolBarRef,
        filteredItems,
        setFilteredItems,
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
