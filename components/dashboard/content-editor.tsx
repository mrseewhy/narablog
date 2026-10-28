"use client";

import { useState, useEffect } from "react";
import type { PartialBlock } from "@blocknote/core";
import { FormattingToolbar, useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useTheme } from "next-themes";

import "@blocknote/shadcn/style.css";

import { documentText } from "@/lib/data/validation/post.validate";

export default function ContentEditor({
  initialDocument,
  disabled,
  onReady,
}: {
  initialDocument?: PartialBlock[];
  disabled?: boolean;
  onReady: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const initialText = documentText(initialDocument).trim();
  const [wordCount, setWordCount] = useState(
    initialText ? initialText.split(/\s+/).length : 0,
  );
  const [content, setContent] = useState("");
  const editor = useCreateBlockNote({
    initialContent: initialDocument,
    placeholders: { default: "Start writing your story..." },
  });
  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <div className="space-y-2">
      <div className="post-content-editor overflow-hidden rounded-lg border bg-background focus-within:ring-2 focus-within:ring-ring">
        <BlockNoteView
          editor={editor}
          editable={!disabled}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          formattingToolbar={false}
          onChange={() => {
            const text = documentText(editor.document).trim();
            setWordCount(text ? text.split(/\s+/).length : 0);
            setContent(JSON.stringify(editor.document));
          }}
          aria-labelledby="post-content-label"
        >
          <FormattingToolbar />
        </BlockNoteView>
      </div>
      <input
        type="hidden"
        name="content"
        value={content || JSON.stringify(editor.document)}
      />
      <p className="text-xs text-muted-foreground">{wordCount} words</p>
    </div>
  );
}
