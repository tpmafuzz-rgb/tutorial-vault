import * as React from "react";

/**
 * Minimal, dependency-free renderer for the limited markdown subset the
 * tutorial body supports: ## headings, - bullets, 1. numbered lists,
 * [text](url) links, and **bold**. No dangerouslySetInnerHTML — safe by design.
 */
function renderInline(text: string, key: React.Key): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = linkRe.exec(text))) {
    if (m.index > last)
      parts.push(renderBold(text.slice(last, m.index), `${key}-t${idx++}`));
    parts.push(
      <a
        key={`${key}-l${idx++}`}
        href={m[2]}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-ink underline decoration-line underline-offset-2 hover:decoration-ink"
      >
        {m[1]}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(renderBold(text.slice(last), `${key}-t${idx++}`));
  return parts;
}

function renderBold(text: string, key: React.Key): React.ReactNode {
  const segs = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <React.Fragment key={key}>
      {segs.map((s, i) =>
        s.startsWith("**") && s.endsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">
            {s.slice(2, -2)}
          </strong>
        ) : (
          <React.Fragment key={i}>{s}</React.Fragment>
        )
      )}
    </React.Fragment>
  );
}

export function RichContent({ source }: { source: string }) {
  if (!source?.trim())
    return <p className="text-[13.5px] italic text-muted">Nothing added yet.</p>;

  const lines = source.split("\n");
  const blocks: React.ReactNode[] = [];
  // ordered items carry the number the author actually typed, so a list that
  // is broken up by other lines (e.g. "1. term" then a definition, then
  // "2. term") keeps 1, 2, 3 instead of every item resetting to 1.
  let list: { ordered: boolean; items: { num: number | null; text: string }[] } | null =
    null;
  let key = 0;

  const flush = () => {
    if (!list) return;
    const items = list.items;
    if (list.ordered) {
      blocks.push(
        <ol key={key++} className="my-2 space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-ink/90">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-surface text-[11px] font-semibold text-muted">
                {it.num ?? i + 1}
              </span>
              <span>{renderInline(it.text, `o${key}-${i}`)}</span>
            </li>
          ))}
        </ol>
      );
    } else {
      blocks.push(
        <ul key={key++} className="my-2 space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-ink/90">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/40" />
              <span>{renderInline(it.text, `u${key}-${i}`)}</span>
            </li>
          ))}
        </ul>
      );
    }
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      blocks.push(
        <h3
          key={key++}
          className="mb-1.5 mt-5 text-[14.5px] font-semibold tracking-tight text-ink first:mt-0"
        >
          {line.slice(3)}
        </h3>
      );
    } else if (/^[-*•]\s+/.test(line)) {
      if (!list || list.ordered) {
        flush();
        list = { ordered: false, items: [] };
      }
      list.items.push({ num: null, text: line.replace(/^[-*•]\s+/, "") });
    } else if (/^(\d+)\.\s+/.test(line)) {
      const m = line.match(/^(\d+)\.\s+/)!;
      if (!list || !list.ordered) {
        flush();
        list = { ordered: true, items: [] };
      }
      list.items.push({ num: parseInt(m[1], 10), text: line.slice(m[0].length) });
    } else {
      flush();
      blocks.push(
        <p key={key++} className="my-2 text-[14px] leading-relaxed text-ink/90">
          {renderInline(line, `p${key}`)}
        </p>
      );
    }
  }
  flush();

  return <div>{blocks}</div>;
}
