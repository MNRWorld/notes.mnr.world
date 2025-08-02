"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getNote } from "@/lib/storage";
import { Note } from "@/lib/types";
import EditorPageClient from "./_components/page-client";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.noteId as string;
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    if (!noteId) return;

    if (noteId === "new") {
      router.replace("/notes");
      return;
    }

    const fetchNote = async () => {
      try {
        const fetchedNote = await getNote(noteId);
        if (fetchedNote) {
          setNote(fetchedNote);
        } else {
          router.replace("/notes");
        }
      } catch (error) {
        console.error("Failed to fetch note:", error);
        router.replace("/notes");
      }
    };

    fetchNote();
  }, [noteId, router]);

  if (!note) {
    return null;
  }

  return <EditorPageClient note={note} />;
}
