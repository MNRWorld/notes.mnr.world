"use client";

// Custom tools are local modules (small) — import them directly
import { DrawingTool } from "./editor-tools/drawing-tool";
import { CustomHeader } from "./editor-tools/custom-header";

export const getEditorTools = async () => {
  // Dynamically import third-party EditorJS tools only when the editor initializes.
  // This keeps the main client bundle smaller and defers loading heavy tool code.
  const [{ default: List }, { default: Quote }, { default: InlineCode }, { default: Checklist }, { default: Table }, { default: CodeTool }, { default: Marker }, { default: Embed }] = await Promise.all([
    import("@editorjs/list"),
    import("@editorjs/quote"),
    import("@editorjs/inline-code"),
    import("@editorjs/checklist"),
    import("@editorjs/table"),
    import("@editorjs/code"),
    import("@editorjs/marker"),
    import("@editorjs/embed"),
  ]);

  return {
    header: {
      class: CustomHeader,
      inlineToolbar: true,
      shortcut: "CMD+SHIFT+H",
      config: {
        placeholder: "\u09b6\u09bf\u09b0\u09cb\u09a8\u09be\u09ae...",
        levels: [1, 2, 3, 4],
        defaultLevel: 1,
      },
    },
    paragraph: {
      config: {
        placeholder: "\u098f\u0996\u09be\u09a8\u09c7 \u09b2\u09bf\u0996\u09c1\u09a8...",
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
      config: {
        quotePlaceholder: "\u0989\u09a6\u09cd\u09a7\u09c3\u09a4\u09bf \u09b2\u09bf\u0996\u09c1\u09a8...",
        captionPlaceholder: "",
      },
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
    drawing: {
      class: DrawingTool,
      config: {
        placeholder: "\u0985\u0999\u09cd\u0995\u09a8 \u0995\u09b0\u09c1\u09a8...",
      },
    },
  };
};
