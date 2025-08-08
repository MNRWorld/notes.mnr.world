"use client";

import { Suspense } from "react";
import { EditorContent } from "./_components/editor-content";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function EditorPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EditorContent />
    </Suspense>
  );
}
