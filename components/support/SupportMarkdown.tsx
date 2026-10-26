import { parseSupportMarkdown, type InlineRun } from "@/lib/support/markdown";

// Renders the safe markdown AST as plain text nodes.
// NO dangerouslySetInnerHTML anywhere — model output cannot inject HTML/JS.

function Runs({ runs }: { runs: InlineRun[] }) {
  return (
    <>
      {runs.map((r, i) =>
        r.type === "bold" ? (
          <strong key={i} className="font-semibold text-charcoal">
            {r.text}
          </strong>
        ) : r.type === "code" ? (
          <code key={i} className="rounded bg-sand px-1 py-0.5 text-[0.85em] text-espresso">
            {r.text}
          </code>
        ) : (
          <span key={i}>{r.text}</span>
        )
      )}
    </>
  );
}

export default function SupportMarkdown({ text }: { text: string }) {
  const blocks = parseSupportMarkdown(text);
  return (
    <div className="space-y-1.5 text-[13.5px] leading-relaxed text-espresso">
      {blocks.map((b, i) => {
        if (b.type === "heading") {
          return (
            <p key={i} className="pt-1 text-sm font-bold text-charcoal">
              <Runs runs={b.runs} />
            </p>
          );
        }
        if (b.type === "bullets") {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {b.items.map((item, j) => (
                <li key={j}>
                  <Runs runs={item} />
                </li>
              ))}
            </ul>
          );
        }
        if (b.type === "numbers") {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5">
              {b.items.map((item, j) => (
                <li key={j}>
                  <Runs runs={item} />
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i}>
            <Runs runs={b.runs} />
          </p>
        );
      })}
    </div>
  );
}
