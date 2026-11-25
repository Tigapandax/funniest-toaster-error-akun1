// funniest-toaster-error: emits the toaster's error line as /output/entry.txt
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_CHARS = 120;
const SOURCE_FILE = "one-line.txt";

function loadLine(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = readFileSync(join(here, SOURCE_FILE), "utf8");
  // Only a trailing newline is stripped; inner whitespace is the entry.
  return raw.replace(/\r?\n$/, "");
}

function problems(line: string): string[] {
  const found: string[] = [];
  const glyphs = [...line];
  if (line.trim().length === 0) found.push("entry is empty or only whitespace");
  if (glyphs.length > MAX_CHARS) found.push(`entry is ${glyphs.length} chars, max ${MAX_CHARS}`);
  if (line.includes("\n") || line.includes("\r")) found.push("entry must be a single line");
  if (line.trim().split(/\s+/).length < 3) found.push("entry needs at least 3 words");
  for (const ch of line) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 && ch !== "\t") {
      found.push("entry contains a control character");
      break;
    }
  }
  return found;
}

function main(): void {
  const line = loadLine();
  const bad = problems(line);
  if (bad.length > 0) {
    for (const b of bad) console.error(`invalid entry: ${b}`);
    process.exit(1);
  }
  const outDir = process.env.OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), line + "\n", "utf8");
  console.log(`OK: ${[...line].length}/${MAX_CHARS} characters, single line`);
}

main();
