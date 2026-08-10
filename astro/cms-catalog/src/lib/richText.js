// Wix CMS RICH_TEXT fields can hold either a plain HTML string (what this
// project seeds) or a Ricos node-tree object (what the Wix dashboard's rich
// text editor writes when an owner edits the item). Never dangerouslySetInnerHTML
// / set:html a Ricos object directly — it dumps raw JSON onto the page.

function escapeHtml(s) {
	return String(s)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

function ricosNodeText(node) {
	if (!node) return "";
	if (node.type === "TEXT") return node.textData?.text ?? "";
	return (node.nodes || []).map(ricosNodeText).join("");
}

// Best-effort: renders a Ricos document as a sequence of <p> blocks. Not a
// full Ricos viewer (no lists/embeds/galleries) — good enough for a body
// field that's mostly paragraphs, and always safe (never raw JSON on the page).
function ricosToHtml(doc) {
	const nodes = doc?.nodes || [];
	return nodes
		.map((n) => `<p>${escapeHtml(ricosNodeText(n))}</p>`)
		.join("");
}

function ricosToPlainText(doc) {
	const nodes = doc?.nodes || [];
	return nodes.map(ricosNodeText).join(" ").trim();
}

// Returns safe HTML for dangerouslySetInnerHTML / set:html.
export function richTextToHtml(value) {
	if (!value) return "";
	if (typeof value === "string") return value; // seeded as plain HTML — stored verbatim
	if (typeof value === "object") return ricosToHtml(value);
	return "";
}

// Returns plain text — for <meta name="description">, card excerpts, etc.
export function richTextToPlainText(value) {
	if (!value) return "";
	if (typeof value === "string") {
		return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
	}
	if (typeof value === "object") return ricosToPlainText(value);
	return "";
}
