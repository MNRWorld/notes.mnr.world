"use client";

import { useEffect, useRef } from "react";
import EditorJS, { type OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import InlineCode from "@editorjs/inline-code";
import Checklist from "@editorjs/checklist";

const EDITOR_TOOLS = {
  header: {
    class: Header,
    inlineToolbar: true,
    config: {},
  },
  list: {
    class: List,
    inlineToolbar: true,
  },
  checklist: {
    class: Checklist,
    inlineToolbar: true,
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  inlineCode: {
    class: InlineCode,
    inlineToolbar: true,
  },
};

interface EditorProps {
  content: string | OutputData;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function Editor({ content, onChange, placeholder }: EditorProps) {
  const editorRef = useRef<EditorJS | null>(null);

  // Initialization effect
  useEffect(() => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "editor",
        tools: EDITOR_TOOLS,
        data:
          typeof content === "string" && content
            ? JSON.parse(content)
            : { blocks: [] },
        placeholder: placeholder || "Start typing...",
        onChange: async (api) => {
          const savedData = await api.saver.save();
          onChange(JSON.stringify(savedData));
        },
      });
      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  // Content update effect
  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const updateContent = async () => {
      try {
        await editorRef.current!.isReady;
        const savedData = await editorRef.current!.save();
        const newContentData =
          typeof content === "string" && content
            ? JSON.parse(content)
            : { blocks: [] };

        // stringify for deep comparison
        if (
          JSON.stringify(savedData.blocks) !==
          JSON.stringify(newContentData.blocks)
        ) {
          await editorRef.current!.render(newContentData);
        }
      } catch (e) {
        // Error updating content
      }
    };

    updateContent();
  }, [content]);

  return <div id="editor" className="prose max-w-none dark:prose-invert" />;
}
