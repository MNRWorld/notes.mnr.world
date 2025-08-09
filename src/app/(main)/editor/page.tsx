
"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const EditorContent = dynamic(() => import("./_components/editor-content").then(mod => mod.EditorContent), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

export default function EditorPage() {
  return (
    <div className="h-full">
      <Suspense fallback={<LoadingSpinner />}>
        <EditorContent />
      </Suspense>
    </div>
  );
}
