import { parseStroke, Stroke, strokeKeys } from "./stroke";
import { StenoDictionary } from "./translator";

export type Outline = {
  text: string;
  strokes: Stroke[];
};

export type LoadedDictionary = StenoDictionary & {
  /**
   * Best outline for a word as it appears in a test, if there is one.
   * `maxKeys` only accepts outlines whose every stroke has at most that many keys.
   */
  lookup: (word: string, maxKeys?: number) => Outline | undefined;
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
  // outlines per word, best first once sorted
  const reverse = new Map<string, RankedOutline[]>();
  let longestOutline = 1;

  for (const [outline, english] of entries) {
    const strokeCount = outline.split("/").length;
    if (strokeCount > longestOutline) longestOutline = strokeCount;

    if (english.includes("{")) continue;
    words.add(english.toLowerCase());
    const ranked = rank(outline);
    if (ranked === undefined) continue;
    const outlines = reverse.get(english);
    if (outlines === undefined) {
      reverse.set(english, [ranked]);
    } else {
      outlines.push(ranked);
    }
  }
  for (const outlines of reverse.values()) {
    outlines.sort((a, b) => a.cost - b.cost);
  }

  const find = (word: string, maxKeys: number): Outline | undefined => {
    const found = reverse
      .get(word)
      ?.find((outline) => outline.largestStroke <= maxKeys);
    if (found === undefined) return undefined;
    return { text: found.text, strokes: found.strokes };
  };

  return {
    entries,
    longestOutline,
    isWord: (word) => words.has(word),
    lookup: (word, maxKeys = Infinity) => {
      // test words carry punctuation and capitals the dictionary entry won't
      const bare = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
      return (
        find(word, maxKeys) ??
        find(bare, maxKeys) ??
        find(bare.toLowerCase(), maxKeys) ??
        find(bare.charAt(0).toUpperCase() + bare.slice(1), maxKeys)
      );
    },
  };
}

type RankedOutline = Outline & {
  cost: number;
  /** key count of the biggest stroke */
  largestStroke: number;
};

// fewer strokes first, then fewer keys, and prefer outlines without the
// number bar or asterisk
function rank(outline: string): RankedOutline | undefined {
  const texts = outline.split("/");
  const strokes: Stroke[] = [];
  let keys = 0;
  let penalty = 0;
  let largestStroke = 0;
  for (const text of texts) {
    const stroke = parseStroke(text);
    if (stroke === undefined) return undefined;
    strokes.push(stroke);
    const count = strokeKeys(stroke).length;
    keys += count;
    if (count > largestStroke) largestStroke = count;
    if (/[#\d*]/.test(text)) penalty++;
  }
  return {
    text: outline,
    strokes,
    cost: texts.length * 1000 + penalty * 100 + keys,
    largestStroke,
  };
}
