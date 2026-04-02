import Link from "@tiptap/extension-link";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

const extensions = [
  StarterKit.configure({
    heading: false,
    codeBlock: false,
    code: false,
    horizontalRule: false,
  }),
  Link.configure({ openOnClick: false }),
];

/**
 * Converts stored TipTap JSON (from recruiter API) back to HTML for the job post form.
 */
export function tiptapJsonToHtml(json: unknown): string {
  if (!json || typeof json !== "object") return "";
  try {
    return generateHTML(json as JSONContent, extensions);
  } catch {
    return "";
  }
}
