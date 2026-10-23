"use client";

import { useState } from "react";
import type { PartialBlock } from "@blocknote/core";
import { FormattingToolbar, useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useTheme } from "next-themes";

import "@blocknote/shadcn/style.css";

function documentText(value: unknown): string {
  if (Array.isArray(value)) return value.map(documentText).join(" ");
  if (!value || typeof value !== "object") return "";
  const node = value as Record<string, unknown>;
  if (typeof node.text === "string") return node.text;
  return [documentText(node.content), documentText(node.children)].join(" ");
}

export default function ContentEditor({ initialText = "" }: { initialText?: string }) {
  const { resolvedTheme } = useTheme();
  const [wordCount, setWordCount] = useState(initialText.trim() ? initialText.trim().split(/\s+/).length : 0);
  const [content, setContent] = useState("");
  const initialContent: PartialBlock[] | undefined = initialText.trim()
    ? initialText.split(/\n\s*\n/).map(paragraph => ({ type: "paragraph", content: paragraph }))
    : undefined;
  const editor = useCreateBlockNote({
    initialContent,
    placeholders: { default: "Start writing your story..." },
  });

  return (
    <div className="space-y-2">
      <div className="post-content-editor overflow-hidden rounded-lg border bg-background focus-within:ring-2 focus-within:ring-ring">
        <BlockNoteView
          editor={editor}
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
      <input type="hidden" name="content" value={content || JSON.stringify(editor.document)} />
      <p className="text-xs text-muted-foreground">{wordCount} words</p>
    </div>
  );
}
