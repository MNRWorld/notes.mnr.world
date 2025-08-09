
"use client";

import { useEffect, useRef, memo } from "react";
import EditorJS, { type OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import InlineCode from "@editorjs/inline-code";
import Checklist from "@editorjs/checklist";
import Table from "@editorjs/table";
import CodeTool from '@editorjs/code';
import Marker from '@editorjs/marker';
import Strikethrough from 'editorjs-strikethrough';

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
  },
  table: {
    class: Table,
    inlineToolbar: true,
  },
  code: {
    class: CodeTool,
  },
  marker: {
    class: Marker,
    shortcut: 'CMD+SHIFT+M',
  },
  strikethrough: {
    class: Strikethrough,
  },
};

interface EditorProps {
  content?: OutputData;
  onChange: (content: OutputData) => void;
  placeholder?: string;
}

function EditorComponent({ content, onChange, placeholder }: EditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (isMountedRef.current) return;
    isMountedRef.current = true;

    const editor = new EditorJS({
      holder: "editor",
      tools: EDITOR_TOOLS,
      data: content,
      placeholder: placeholder || "Start typing...",
      
      async onChange(api) {
        if (editorRef.current) {
          const savedData = await api.saver.save();
          onChange(savedData);
        }
      },
      
      onReady: () => {
        editorRef.current = editor;
      },
      
      autofocus: true
    });

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
      isMountedRef.current = false;
    };
  }, []);

  return <div id="editor" className="prose max-w-none dark:prose-invert" />;
}

const Editor = memo(EditorComponent);
export default Editor;
