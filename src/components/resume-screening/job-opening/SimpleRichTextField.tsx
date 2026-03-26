"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { normalizePlainTextToHtml } from "@/lib/rich-text-html";
import { cn } from "@/lib/utils";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Link2, List, ListOrdered } from "lucide-react";
import React, { useEffect } from "react";

type SimpleRichTextFieldProps = {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  error?: string;
};

export default function SimpleRichTextField({
  label,
  value,
  onChange,
  rows = 6,
  required,
  error,
}: SimpleRichTextFieldProps) {
  const minHeightRem = Math.max(8, rows * 1.25);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-600 underline underline-offset-2 dark:text-brand-400",
        },
      }),
    ],
    content: normalizePlainTextToHtml(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "tiptap w-full px-3 py-2 text-sm text-foreground outline-none",
          "[&_p]:my-1 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5",
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;
    const next = normalizePlainTextToHtml(value);
    const cur = editor.getHTML();
    if (cur === next) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [value, editor]);

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-brand-700 dark:text-brand-400">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </div>
      <Card
        className={cn(
          "overflow-hidden py-0 gap-0",
          error && "ring-2 ring-destructive",
        )}
      >
        <div className="flex flex-wrap gap-1 border-b border-border bg-muted/50 px-2 py-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            title="Bold"
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={cn(
              editor?.isActive("bold") && "bg-muted text-foreground",
            )}
          >
            <Bold className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            title="Italic"
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={cn(
              editor?.isActive("italic") && "bg-muted text-foreground",
            )}
          >
            <Italic className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            title="Bullet list"
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={cn(
              editor?.isActive("bulletList") && "bg-muted text-foreground",
            )}
          >
            <List className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            title="Numbered list"
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={cn(
              editor?.isActive("orderedList") && "bg-muted text-foreground",
            )}
          >
            <ListOrdered className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            title="Link"
            disabled={!editor}
            onClick={setLink}
            className={cn(
              editor?.isActive("link") && "bg-muted text-foreground",
            )}
          >
            <Link2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <CardContent
          className="px-0 py-0"
          style={{ minHeight: `${minHeightRem}rem` }}
        >
          <EditorContent
            editor={editor}
            className="h-full min-h-[inherit] [&_.tiptap]:min-h-[inherit]"
            style={{ minHeight: `${minHeightRem}rem` }}
          />
        </CardContent>
      </Card>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
