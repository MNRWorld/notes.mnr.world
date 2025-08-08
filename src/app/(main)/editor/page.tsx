"use client";

import { Suspense } from "react";
import { EditorContent } from "./_components/editor-content";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function EditorPage() {
  return (
    <div className="h-full">
      <Suspense fallback={<LoadingSpinner />}>
        <EditorContent />
      </Suspense>
    </div>
  );
}
