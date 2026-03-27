import React, { createContext, useContext, useState } from "react";

const EditorContext = createContext();

const EditorProvider = ({ children }) => {
  const [activeEditor, setActiveEditor] = useState(null);
  const [editorState, setEditorState] = useState({});

  return (
    <EditorContext.Provider
      value={{ activeEditor, setActiveEditor, editorState, setEditorState }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export function useEditorContext() {
  return useContext(EditorContext);
}

export default EditorProvider;
