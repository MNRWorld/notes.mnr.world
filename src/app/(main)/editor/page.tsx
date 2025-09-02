"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const EditorContent = dynamic(() => import("@/components/editor-content"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

export default function EditorPage() {
  return (
    <div className="h-full flex flex-col">
      <EditorContent />
    </div>
  );
}
