// Concierge — the pit-wall radio widget. A floating launcher on every page
// opens a small chat panel; messages go to /api/concierge, which streams back
// a simplified SSE protocol (text / tool / error / done — see that route).
// Claude answers as the APEX pit-wall operator and drives the site's own MCP
// tools for live availability. Transcript persists per-tab in sessionStorage
// so ClientRouter swaps and hard reloads keep the conversation.
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";

type Msg = {
  role: "user" | "assistant";
  content: string;
  tools?: string[]; // MCP tool calls surfaced as status lines above the reply
  error?: boolean;
};

const STORE_KEY = "apex:concierge";
const SUGGESTIONS = [
  "What can I drive this weekend?",
  "Fastest car for a first-timer?",
  "A gift under €300 — what fits?",
];

// Friendly labels for the site MCP tool names streamed by the endpoint.
const TOOL_LABELS: Record<string, string> = {
  SearchInSite: "searching the site",
  SearchSiteApiDocs: "reading the site APIs",
  GenerateVisitorToken: "opening a visitor pass",
  CallWixSiteAPI: "checking live availability",
  GetBusinessDetails: "pulling business details",
};

// Markdown-lite → React nodes: [text](url), **bold**, line breaks. Everything
// else renders as plain text (no raw HTML ever reaches the DOM).
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[3] !== undefined) {
      nodes.push(<strong key={key++}>{match[3]}</strong>);
    } else {
      // Site links navigate in-tab (drop the origin so ClientRouter handles
      // them); anything external opens a new tab.
      const href = match[2].replace(/^https?:\/\/(www\.)?apex-drive\.co/, "") || "/";
      const external = /^https?:/.test(href);
      nodes.push(
        <a
          key={key++}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {match[1]}
        </a>,
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderContent(content: string): ReactNode[] {
  return content.split("\n").flatMap((line, i) => {
    const parts = renderInline(line);
    return i === 0 ? parts : [<br key={`br-${i}`} />, ...parts];
  });
}

export default function Concierge() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  // Mirror of `messages` readable synchronously inside send() — state updaters
  // are batched in React 18, so the request body must not depend on them.
  const messagesRef = useRef<Msg[]>([]);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Hydrate the transcript from this tab's earlier radio traffic.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    messagesRef.current = messages;
    try {
      if (messages.length) sessionStorage.setItem(STORE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Keep the latest transmission in view.
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, 2000);
      if (!text || busy) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setBusy(true);
      setInput("");

      // Build the request history synchronously — never inside a state
      // updater (React batches them, so the fetch would see an empty array).
      const history: Msg[] = [...messagesRef.current, { role: "user", content: text }];
      messagesRef.current = [...history, { role: "assistant", content: "", tools: [] }];
      setMessages(messagesRef.current);

      const patchReply = (patch: (m: Msg) => Msg) =>
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = patch(next[next.length - 1]);
          return next;
        });

      try {
        const res = await fetch("/api/concierge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            // Error transmissions stay visible but out of the model context.
            // Truncate round-tripped replies and keep the window starting on
            // a user turn — the API (and the endpoint) require it.
            messages: (() => {
              const wire = history
                .filter((m) => !m.error && m.content)
                .map(({ role, content }) => ({ role, content: content.slice(0, 2000) }))
                .slice(-16);
              while (wire.length && wire[0].role === "assistant") wire.shift();
              return wire;
            })(),
          }),
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const frame of frames) {
            const line = frame.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;
            let event: any;
            try {
              event = JSON.parse(line.slice(6));
            } catch {
              continue;
            }
            if (event.type === "text" && event.text) {
              patchReply((m) => ({ ...m, content: m.content + event.text }));
            } else if (event.type === "tool") {
              const label = TOOL_LABELS[event.name] ?? `running ${event.name}`;
              patchReply((m) =>
                m.tools?.includes(label) ? m : { ...m, tools: [...(m.tools ?? []), label] },
              );
            } else if (event.type === "error") {
              patchReply((m) => ({
                ...m,
                error: true,
                content: m.content || event.message,
              }));
            }
          }
        }
        // A silent stream (nothing arrived) still deserves a reply bubble.
        patchReply((m) =>
          m.content
            ? m
            : { ...m, error: true, content: "Radio silence from the pit wall — try again in a moment." },
        );
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          patchReply((m) => ({
            ...m,
            error: true,
            content: m.content || "Lost the radio link — give it another go in a moment.",
          }));
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setBusy(false);
        }
      }
    },
    [busy],
  );

  useEffect(() => () => abortRef.current?.abort(), []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <div className="concierge-root">
      {open && (
        <section
          className="concierge-panel"
          role="dialog"
          aria-label="APEX Concierge — pit wall radio"
        >
          <header className="concierge-head">
            <span className={`concierge-status${busy ? " live" : ""}`} aria-hidden="true" />
            <div className="concierge-head-titles">
              <span className="concierge-title">The Concierge</span>
              <span className="concierge-sub">Pit wall · radio open</span>
            </div>
            <button
              type="button"
              className="concierge-close"
              aria-label="Close the concierge"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </header>

          <div className="concierge-transcript" ref={transcriptRef} aria-live="polite">
            {messages.length === 0 && (
              <div className="concierge-intro">
                <p>
                  Pit wall here. Tell me what kind of drive you're after — I'll check the
                  garage and the calendar, live.
                </p>
                <div className="concierge-chips">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => void send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`concierge-msg ${m.role}${m.error ? " error" : ""}`}>
                {m.tools && m.tools.length > 0 && (
                  <div className="concierge-tools">
                    {m.tools.map((t) => (
                      <span key={t}>› {t}</span>
                    ))}
                  </div>
                )}
                {m.content ? (
                  <div className="concierge-bubble">{renderContent(m.content)}</div>
                ) : (
                  m.role === "assistant" &&
                  busy &&
                  i === messages.length - 1 && (
                    <div className="concierge-bubble concierge-typing" aria-label="Concierge is replying">
                      <span />
                      <span />
                      <span />
                    </div>
                  )
                )}
              </div>
            ))}
          </div>

          <form className="concierge-form" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              maxLength={2000}
              placeholder="Radio the pit wall…"
              aria-label="Message the concierge"
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send">
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className={`concierge-launcher${open ? " open" : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="concierge-launcher-dot" aria-hidden="true" />
        Concierge
      </button>
    </div>
  );
}
