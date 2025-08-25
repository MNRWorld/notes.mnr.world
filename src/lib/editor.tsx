"use client";

import { useEffect, useRef, memo } from "react";
import EditorJS, { type OutputData } from "@editorjs/editorjs";
import { getEditorTools } from "./editor-tools";

interface EditorProps {
  content?: OutputData;
  onChange: (content: OutputData) => void;
  placeholder?: string;
  isReadOnly?: boolean;
}

const EditorComponent = ({
  content,
  onChange,
  placeholder,
  isReadOnly = false,
}: EditorProps) => {
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      const initializeEditor = async () => {
        const tools = await getEditorTools();
        const editor = new EditorJS({
          holder: "editor",
          tools: tools,
          data: content,
          placeholder: placeholder,
          async onChange(api) {
            if (!isReadOnly) {
              const savedData = await api.saver.save();
              onChange(savedData);
            }
          },

          autofocus: false,
          readOnly: isReadOnly,
          minHeight: 10,
        });
        editorRef.current = editor;
      };
      initializeEditor();
    }

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [isReadOnly, placeholder, content, onChange]);

  return <div id="editor" className="prose max-w-none dark:prose-invert" />;
};

EditorComponent.displayName = "EditorComponent";

const Editor = memo(EditorComponent);
export default Editor;
