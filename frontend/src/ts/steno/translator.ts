import { addSuffix } from "./orthography";
import { Stroke, strokeToString, UNDO_STROKE } from "./stroke";

export type StenoDictionary = {
  entries: Map<string, string>;
  /** most strokes in any outline */
  longestOutline: number;
  isWord: (word: string) => boolean;
};

type Translation = {
  strokes: string[];
  /** undefined when the outline isn't in the dictionary */
  english: string | undefined;
};

export type OutputChange = {
  backspaces: number;
  text: string;
};

const MAX_HISTORY = 200;

/**
 * Turns strokes into text the way Plover does: greedy longest-outline matching
 * over recent strokes, spaces before words, `*` to undo.
 */
export class Translator {
  private translations: Translation[] = [];
  private output = "";
  private dictionary: StenoDictionary;

  constructor(dictionary: StenoDictionary) {
    this.dictionary = dictionary;
  }

  reset(): void {
    this.translations = [];
    this.output = "";
  }

  stroke(stroke: Stroke): OutputChange {
    if (stroke === UNDO_STROKE) {
      this.undo();
    } else {
      this.add(strokeToString(stroke));
    }

    if (this.translations.length > MAX_HISTORY) {
      // forget old strokes without touching what was already typed
      this.translations = this.translations.slice(MAX_HISTORY / 2);
      this.output = format(this.translations, this.dictionary);
      return { backspaces: 0, text: "" };
    }

    const next = format(this.translations, this.dictionary);
    const change = diff(this.output, next);
    this.output = next;
    return change;
  }

  private add(stroke: string): void {
    const { entries, longestOutline } = this.dictionary;

    // how many previous translations fit in the longest possible outline
    let strokeCount = 1;
    let reach = 0;
    for (let i = this.translations.length - 1; i >= 0; i--) {
      strokeCount += (this.translations[i] as Translation).strokes.length;
      if (strokeCount > longestOutline) break;
      reach++;
    }

    for (let take = reach; take >= 1; take--) {
      const replaced = this.translations.slice(-take);
      const strokes = [...replaced.flatMap((t) => t.strokes), stroke];
      const english = entries.get(strokes.join("/"));
      if (english !== undefined) {
        this.translations.splice(-take, take, { strokes, english });
        return;
      }
    }

    this.translations.push({ strokes: [stroke], english: entries.get(stroke) });
  }

  private undo(): void {
    const last = this.translations.pop();
    if (last === undefined) return;
    // a multi-stroke outline loses its last stroke, the rest is replayed
    for (const stroke of last.strokes.slice(0, -1)) this.add(stroke);
  }
}

function diff(before: string, after: string): OutputChange {
  let common = 0;
  const max = Math.min(before.length, after.length);
  while (common < max && before[common] === after[common]) common++;
  return { backspaces: before.length - common, text: after.slice(common) };
}

type FormatState = {
  text: string;
  attach: boolean;
  capitalize: boolean;
  lowercase: boolean;
  uppercase: boolean;
  lastWasGlue: boolean;
};

const SENTENCE_END = new Set([".", "?", "!"]);
const PUNCTUATION = new Set([",", ":", ";"]);

function format(
  translations: Translation[],
  dictionary: StenoDictionary,
): string {
  const state: FormatState = {
    text: "",
    attach: true,
    capitalize: false,
    lowercase: false,
    uppercase: false,
    lastWasGlue: false,
  };

  for (const translation of translations) {
    if (translation.english === undefined) {
      const raw = translation.strokes.join("/");
      // number strokes type their digits and stick together
      if (/^\d+$/.test(raw)) {
        write(state, raw, { glue: true });
      } else {
        write(state, raw, {});
      }
      continue;
    }

    for (const atom of translation.english.match(/\{[^}]*\}|[^{}]+/g) ?? []) {
      if (atom.startsWith("{")) {
        applyMeta(state, atom.slice(1, -1), dictionary);
      } else if (atom.trim() !== "") {
        write(state, atom.trim(), {});
      }
    }
  }

  return state.text;
}

function applyMeta(
  state: FormatState,
  meta: string,
  dictionary: StenoDictionary,
): void {
  if (meta === "") return;
  // key combos and Plover commands have no meaning in a typing test
  if (meta.startsWith("#") || /^(PLOVER|MODE|:)/i.test(meta)) return;

  if (SENTENCE_END.has(meta)) {
    write(state, meta, { attachStart: true });
    state.capitalize = true;
    return;
  }
  if (PUNCTUATION.has(meta)) {
    write(state, meta, { attachStart: true });
    return;
  }

  switch (meta) {
    case "-|":
      state.capitalize = true;
      return;
    case ">":
      state.lowercase = true;
      return;
    case "<":
      state.uppercase = true;
      return;
    case "*-|":
      state.text = state.text.replace(
        /(\S)(\S*)$/,
        (_, a: string, b: string) => a.toUpperCase() + b,
      );
      return;
    case "*>":
      state.text = state.text.replace(
        /(\S)(\S*)$/,
        (_, a: string, b: string) => a.toLowerCase() + b,
      );
      return;
    case "*<":
      state.text = state.text.replace(/\S+$/, (word) => word.toUpperCase());
      return;
    case "^":
      state.attach = true;
      return;
    default:
  }

  if (meta.startsWith("&")) {
    write(state, meta.slice(1), { glue: true });
    return;
  }

  let body = meta;
  const keepCase = body.includes("~|");
  body = body.replace("~|", "");
  const attachStart = body.startsWith("^");
  const attachEnd = body.length > 1 && body.endsWith("^");
  if (attachStart) body = body.slice(1);
  if (attachEnd) body = body.slice(0, -1);

  if (body !== "") {
    write(state, body, {
      attachStart,
      keepCase,
      isWord: attachStart ? dictionary.isWord : undefined,
    });
  }
  if (attachEnd) state.attach = true;
}

function write(
  state: FormatState,
  text: string,
  options: {
    attachStart?: boolean;
    glue?: boolean;
    keepCase?: boolean;
    isWord?: (word: string) => boolean;
  },
): void {
  const attach =
    state.attach ||
    options.attachStart === true ||
    (options.glue === true && state.lastWasGlue);

  if (!options.keepCase) {
    if (state.capitalize) {
      text = text.charAt(0).toUpperCase() + text.slice(1);
    } else if (state.lowercase) {
      text = text.charAt(0).toLowerCase() + text.slice(1);
    } else if (state.uppercase) {
      text = text.toUpperCase();
    }
    state.capitalize = false;
    state.lowercase = false;
    state.uppercase = false;
  }

  if (!attach) {
    state.text += ` ${text}`;
  } else if (options.isWord !== undefined && !state.attach) {
    state.text = addSuffix(state.text, text, options.isWord);
  } else {
    state.text += text;
  }

  state.attach = false;
  state.lastWasGlue = options.glue === true;
}
