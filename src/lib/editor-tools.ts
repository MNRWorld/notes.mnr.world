"use client";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import InlineCode from "@editorjs/inline-code";
import Checklist from "@editorjs/checklist";
import Table from "@editorjs/table";
import CodeTool from "@editorjs/code";
import Marker from "@editorjs/marker";
import Embed from "@editorjs/embed";

// Import our custom tools
import { MathTool } from "./editor-tools/math-tool";
import { DrawingTool } from "./editor-tools/drawing-tool";

export const getEditorTools = async () => ({
  header: {
    class: Header,
    inlineToolbar: true,
    shortcut: "CMD+SHIFT+H",
    config: {
      placeholder: "শিরোনাম...",
      levels: [1, 2, 3, 4],
      defaultLevel: 1,
    },
  },
  paragraph: {
    config: {
      placeholder: "এখানে লিখুন...",
    },
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
    shortcut: "CMD+SHIFT+C",
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
    shortcut: "CMD+SHIFT+M",
  },
  embed: {
    class: Embed,
    inlineToolbar: true,
    config: {
      services: {
        youtube: true,
        twitter: true,
        codepen: true,
      },
    },
  },
  // New enhanced tools
  math: {
    class: MathTool,
    config: {
      placeholder: "গণিতের সূত্র লিখুন...",
    },
  },
  drawing: {
    class: DrawingTool,
    config: {
      placeholder: "অঙ্কন করুন...",
    },
  },
});
