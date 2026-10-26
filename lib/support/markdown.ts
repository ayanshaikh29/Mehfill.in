// Safe, dependency-free markdown subset for assistant replies.
//
// Output is a small block/inline AST that a React component renders as plain
// text nodes — NOTHING is ever injected as HTML (no dangerouslySetInnerHTML),
// so model output, user text and screenshot-derived text cannot XSS the chat.

export type InlineRun =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "code"; text: string };

export type MarkdownBlock =
  | { type: "heading"; runs: InlineRun[] }
  | { type: "para"; runs: InlineRun[] }
  | { type: "bullets"; items: InlineRun[][] }
  | { type: "numbers"; items: InlineRun[][] };

/** Inline pass: **bold**, `code`, everything else literal. */
export function parseInline(line: string): InlineRun[] {
  const runs: InlineRun[] = [];
  let buf = "";
  let i = 0;
  const pushText = () => {
    if (buf) {
      runs.push({ type: "text", text: buf });
      buf = "";
    }
  };
  while (i < line.length) {
    if (line.startsWith("**", i)) {
      const end = line.indexOf("**", i + 2);
      if (end > i + 2) {
        pushText();
        runs.push({ type: "bold", text: line.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }
    if (line[i] === "`") {
      const end = line.indexOf("`", i + 1);
      if (end > i + 1) {
        pushText();
        runs.push({ type: "code", text: line.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    buf += line[i];
    i++;
  }
  pushText();
  return runs;
}

export function parseSupportMarkdown(text: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = text.replace(/\r/g, "").split("\n");
  let list: { type: "bullets" | "numbers"; items: InlineRun[][] } | null = null;
  let para: InlineRun[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "para", runs: para });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ type: list.type, items: list.items });
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const heading = /^#{1,4}\s+(.*)$/.exec(line);
    if (heading) {
      flushPara();
      flushList();
      blocks.push({ type: "heading", runs: parseInline(heading[1]) });
      continue;
    }
    const bullet = /^(?:[-•*]|\u2022)\s+(.*)$/.exec(line);
    if (bullet) {
      flushPara();
      if (!list || list.type !== "bullets") {
        flushList();
        list = { type: "bullets", items: [] };
      }
      list.items.push(parseInline(bullet[1]));
      continue;
    }
    const numbered = /^\d{1,2}[.)]\s+(.*)$/.exec(line);
    if (numbered) {
      flushPara();
      if (!list || list.type !== "numbers") {
        flushList();
        list = { type: "numbers", items: [] };
      }
      list.items.push(parseInline(numbered[1]));
      continue;
    }
    flushList();
    para = para.length ? [...para, { type: "text", text: " " }, ...parseInline(line)] : parseInline(line);
  }
  flushPara();
  flushList();
  return blocks;
}
