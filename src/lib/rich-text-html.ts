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

/** Lines that look like "• item", "- item", or "1. item" (common in mocks / pasted JDs). */
const PLAIN_TEXT_BULLET_LINE =
  /^(?:[•\-\*·]|\u2022|\u00B7)\s+(.+)$|^\d+\.\s+(.+)$/;

/**
 * If every non-empty line starts with a bullet/number marker, return TipTap-friendly
 * `<ul><li>...</li></ul>` so list toolbar state matches visible bullets.
 */
function tryPlainTextLinesToBulletListHtml(text: string): string | null {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 1) return null;
  const items: string[] = [];
  for (const line of lines) {
    const m = line.match(PLAIN_TEXT_BULLET_LINE);
    if (!m) return null;
    const body = (m[1] ?? m[2] ?? "").trim();
    if (!body) return null;
    items.push(body);
  }
  const inner = items.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  return `<ul>${inner}</ul>`;
}

/**
 * Build `<ul><li>...</li></ul>` from API string arrays (split embedded newlines per item).
 */
export function bulletListHtmlFromLines(items: string[]): string {
  const flat: string[] = [];
  for (const raw of items) {
    for (const part of raw.split(/\r?\n/)) {
      let t = part.trim();
      if (!t) continue;
      const m = t.match(PLAIN_TEXT_BULLET_LINE);
      if (m) {
        t = (m[1] ?? m[2] ?? "").trim();
      }
      if (t) flat.push(t);
    }
  }
  if (!flat.length) return "";
  const inner = flat.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  return `<ul>${inner}</ul>`;
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
  const asList = tryPlainTextLinesToBulletListHtml(v);
  if (asList) return asList;
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
