import { parseStroke, Stroke, strokeKeys } from "./stroke";
import { StenoDictionary } from "./translator";

export type Outline = {
  text: string;
  strokes: Stroke[];
};

export type LoadedDictionary = StenoDictionary & {
  /** best outline for a word as it appears in a test, if there is one */
  lookup: (word: string) => Outline | undefined;
};

let loading: Promise<LoadedDictionary> | undefined;

export async function loadDictionary(): Promise<LoadedDictionary> {
  loading ??= fetchDictionary().catch((error: unknown) => {
    loading = undefined;
    throw error;
  });
  return loading;
}

async function fetchDictionary(): Promise<LoadedDictionary> {
  const [main, commands] = await Promise.all(
    ["plover-main.json", "plover-commands.json"].map(async (file) => {
      const response = await fetch(`/steno/${file}`);
      if (!response.ok) throw new Error(`Failed to load ${file}`);
      return (await response.json()) as Record<string, string>;
    }),
  );
  return buildDictionary({ ...main, ...commands });
}

export function buildDictionary(raw: Record<string, string>): LoadedDictionary {
  const entries = new Map(Object.entries(raw));
  const words = new Set<string>();
  const reverse = new Map<string, string>();
  let longestOutline = 1;

  for (const [outline, english] of entries) {
    const strokeCount = outline.split("/").length;
    if (strokeCount > longestOutline) longestOutline = strokeCount;

    if (english.includes("{")) continue;
    words.add(english.toLowerCase());
    const current = reverse.get(english);
    if (current === undefined || cost(outline) < cost(current)) {
      reverse.set(english, outline);
    }
  }

  const find = (word: string): Outline | undefined => {
    const outline = reverse.get(word);
    if (outline === undefined) return undefined;
    const strokes = outline.split("/").map(parseStroke);
    if (strokes.includes(undefined)) return undefined;
    return { text: outline, strokes: strokes as Stroke[] };
  };

  return {
    entries,
    longestOutline,
    isWord: (word) => words.has(word),
    lookup: (word) => {
      // test words carry punctuation and capitals the dictionary entry won't
      const bare = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
      return (
        find(word) ??
        find(bare) ??
        find(bare.toLowerCase()) ??
        find(bare.charAt(0).toUpperCase() + bare.slice(1))
      );
    },
  };
}

// fewer strokes first, then fewer keys, and prefer outlines without the
// number bar or asterisk
function cost(outline: string): number {
  const strokes = outline.split("/");
  let keys = 0;
  let penalty = 0;
  for (const text of strokes) {
    const stroke = parseStroke(text);
    if (stroke === undefined) return Number.MAX_SAFE_INTEGER;
    keys += strokeKeys(stroke).length;
    if (/[#\d*]/.test(text)) penalty++;
  }
  return strokes.length * 1000 + penalty * 100 + keys;
}
