"use client";

import { useEffect, useRef } from "react";
import EditorJS, { type OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import InlineCode from "@editorjs/inline-code";
import Checklist from "@editorjs/checklist";
import Table from "@editorjs/table";

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
  table: {
    class: Table,
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
  const isReadyRef = useRef(false);

  // Initialization effect
  useEffect(() => {
    if (typeof window === "undefined" || editorRef.current) {
      return;
    }

    const editor = new EditorJS({
      holder: "editor",
      tools: EDITOR_TOOLS,
      data:
        typeof content === "string" && content
          ? JSON.parse(content)
          : { blocks: [] },
      placeholder: placeholder || "Start typing...",
      async onChange(api) {
        if (isReadyRef.current) {
          const savedData = await api.saver.save();
          onChange(JSON.stringify(savedData));
        }
      },
      onReady: () => {
        isReadyRef.current = true;
      },
    });
    editorRef.current = editor;

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
        isReadyRef.current = false;
      }
    };
  }, []);

  // Content update effect
  useEffect(() => {
    if (
      !editorRef.current ||
      !isReadyRef.current
    ) {
      return;
    }

    const updateContent = async () => {
      try {
        await editorRef.current!.isReady;

        // Clear and render only if content is different
        const currentContent = await editorRef.current!.save();
        const newContentData =
          typeof content === "string" && content ? JSON.parse(content) : content;

        if (JSON.stringify(currentContent.blocks) !== JSON.stringify(newContentData.blocks)) {
           editorRef.current!.render(newContentData);
        }
      } catch (e) {
        // console.error("Error updating editor content:", e);
      }
    };

    updateContent();
  }, [content]);

  return <div id="editor" className="prose max-w-none dark:prose-invert" />;
}
