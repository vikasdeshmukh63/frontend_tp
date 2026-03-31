import Link from "@tiptap/extension-link";
import { generateJSON } from "@tiptap/html";
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

const emptyDoc = {
  type: "doc" as const,
  content: [{ type: "paragraph" as const }],
};

/**
 * Converts HTML from `SimpleRichTextField` to TipTap JSON for the recruiter API.
 */
export function htmlToTiptapJson(html: string): Record<string, unknown> {
  const h = (html ?? "").trim();
  if (!h || h === "<p></p>" || h === "<p><br></p>") {
    return emptyDoc as unknown as Record<string, unknown>;
  }
  return generateJSON(h, extensions) as unknown as Record<string, unknown>;
}
