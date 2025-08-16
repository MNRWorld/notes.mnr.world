
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

const EditorComponent = ({ content, onChange, placeholder, isReadOnly = false }: EditorProps) => {
  const editorRef = useRef<EditorJS | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    const initializeEditor = async () => {
      if (!editorRef.current) {
        const tools = await getEditorTools();
        const editor = new EditorJS({
          holder: "editor",
          tools: tools,
          data: content,
          placeholder: placeholder || "Start typing...",
          
          async onChange(api) {
            if (!isReadOnly) {
              const savedData = await api.saver.save();
              onChange(savedData);
            }
          },
          
          autofocus: !isReadOnly,
          readOnly: isReadOnly,
        });
        editorRef.current = editor;
      }
    };

    if (isMountedRef.current) {
        initializeEditor();
    }

    return () => {
      if (isMountedRef.current && editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
      isMountedRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReadOnly]);

  // Update content if it changes externally
  useEffect(() => {
    if (editorRef.current && content) {
       editorRef.current.render(content);
    }
  }, [content])

  return <div id="editor" className="prose max-w-none dark:prose-invert" />;
}

EditorComponent.displayName = "EditorComponent";

const Editor = memo(EditorComponent);
export default Editor;
