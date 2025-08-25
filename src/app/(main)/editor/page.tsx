"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const EditorContent = dynamic(
  () => import("./_components/editor-content").then((mod) => mod.EditorContent),
  {
    ssr: false,
    loading: () => <div className="flex h-full w-full items-center justify-center"><LoadingSpinner /></div>,
  },
);

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><LoadingSpinner /></div>}>
      <EditorContent />
    </Suspense>
  );
}
