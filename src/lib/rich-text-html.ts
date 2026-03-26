import DOMPurify from "isomorphic-dompurify";

/** Detect stored TipTap / HTML content vs plain text from older mocks. */
export function looksLikeHtml(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  return /^<[a-z][\s\S]*>/i.test(t);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Safe HTML for preview (TipTap output). */
export function sanitizeRichHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "h1",
      "h2",
      "h3",
      "h4",
      "code",
      "pre",
      "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });
}

/** Plain text / legacy mocks → HTML paragraphs for TipTap. Already-HTML passes through. */
export function normalizePlainTextToHtml(value: string): string {
  const v = value.trim();
  if (!v) return "<p></p>";
  if (looksLikeHtml(value)) return value;
  return v
    .split(/\n\n+/)
    .map((block) => {
      const inner = block
        .split("\n")
        .map((line) => escapeHtml(line))
        .join("<br>");
      return `<p>${inner}</p>`;
    })
    .join("");
}
