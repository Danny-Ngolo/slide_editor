import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const EditorContext = createContext();

const EditorProvider = ({ children }) => {
  const [activeEditor, setActiveEditor] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState({
    slideId: null,
    blockId: null,
  });
  const [editorState, setEditorState] = useState({});
  const editorContainerRef = useRef(null);
  const editorToolBarRef = useRef(null);

  return (
    <EditorContext.Provider
      value={{
        activeEditor,
        setActiveEditor,
        editorState,
        setEditorState,
        selectedBlock,
        setSelectedBlock,
        editorContainerRef,
        editorToolBarRef,
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
