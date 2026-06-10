import React, { createContext, useContext, useRef, useState } from "react";

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
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [copiedBlocks, setCopiedBlocks] = useState([]);

  const handleSelectBlock = (e, slideId, blockId) => {
    e.stopPropagation();

    // set multiple selectedBlocks with ctrlKey

    if (e.ctrlKey) {
      setSelectedBlocks((prev) => {
        const exists = prev.some(
          (block) => block.slideId === slideId && block.blockId === blockId,
        );

        if (exists) {
          return prev.filter(
            (block) =>
              !(block.slideId === slideId && block.blockId === blockId),
          );
        }

        return [...prev, { slideId, blockId }];
      });

      return;
    } else {
      // Set the single selectedBlock for it is used in other staffs

      setSelectedBlock({
        slideId,
        blockId,
      });
      setSelectedBlocks([{ slideId, blockId }]);
    }
  };

  const isBlockSelected = (slideId, blockId) => {
    return selectedBlocks.some(
      (b) => b.slideId === slideId && b.blockId === blockId,
    );
  };

  return (
    <EditorContext.Provider
      value={{
        activeEditor,
        setActiveEditor,
        editorState,
        setEditorState,
        selectedBlock,
        setSelectedBlock,
        selectedBlocks,
        setSelectedBlocks,
        copiedBlocks,
        setCopiedBlocks,
        editorContainerRef,
        editorToolBarRef,
        handleSelectBlock,
        // deleteSelectedBlocks,
        // duplicateSelectedBlocks,
        // copySelectedBlocks,
        // pasteBlocks,
        isBlockSelected,
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
