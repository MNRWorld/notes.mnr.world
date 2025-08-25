import React from "react";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-full">{children}</div>;
}
