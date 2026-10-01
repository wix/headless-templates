// Shared normalization for CMS rich-text fields (About body, FAQ answers).
import { renderRicos } from "./ricos";

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// A CMS rich field may arrive as a Ricos node tree (RICH_CONTENT), a
// JSON-encoded Ricos string, an HTML string (RICH_TEXT), or plain text.
// Normalize every shape to safe HTML — never set:html raw field values.
export function toHtml(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") return renderRicos(value as never);
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const ricos = renderRicos(trimmed);
  if (ricos) return ricos;
  if (trimmed.startsWith("<")) return trimmed;
  return trimmed
    .split(/\r?\n\s*\r?\n/)
    .map((para) => `<p>${escapeHtml(para).replace(/\r?\n/g, "<br />")}</p>`)
    .join("");
}

// HTML → readable plain text with paragraph breaks preserved — for JSON-LD
// answer text and the markdown body of /llms-full.txt.
export function htmlToText(html: string): string {
  return html
    .replace(/<\/(p|h[1-6]|li|blockquote)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
