"use client";

import { useEffect, useRef, memo } from "react";
import { EditorOutputData } from "./types";

interface EditorProps {
  content?: EditorOutputData;
  onChange: (content: EditorOutputData) => void;
  placeholder?: string;
  isReadOnly?: boolean;
}

const EditorComponent = ({
  content,
  onChange,
  placeholder,
  isReadOnly = false,
}: EditorProps) => {
  const editorRef = useRef<any | null>(null);

  useEffect(() => {
    const initializeEditor = async () => {
      const EditorJS = (await import("@editorjs/editorjs")).default;
      const { getEditorTools } = await import("./editor-tools");

      if (editorRef.current) {
        return;
      }

      const tools = await getEditorTools();
      const editor = new EditorJS({
        holder: "editor",
        tools: tools,
        data: content,
        placeholder: placeholder,
        async onChange(api: any) {
          if (!isReadOnly) {
            const savedData = await api.saver.save();
            onChange(savedData as EditorOutputData);
          }
        },

        autofocus: false,
        readOnly: isReadOnly,
        minHeight: 10,
      });
      editorRef.current = editor;
      await editor.isReady;
    };

    if (!editorRef.current) {
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
