import React, { createContext, useContext, useEffect, useState } from "react";

const EditorContext = createContext();

const EditorProvider = ({ children }) => {
  const [activeEditor, setActiveEditor] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState({
    slideId: null,
    blockId: null,
  });
  const [editorState, setEditorState] = useState({});

  return (
    <EditorContext.Provider
      value={{
        activeEditor,
        setActiveEditor,
        editorState,
        setEditorState,
        selectedBlock,
        setSelectedBlock,
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
