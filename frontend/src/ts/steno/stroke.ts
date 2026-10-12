// English Stenotype layout, in steno order. A stroke is a bitmask over these.
export const STENO_KEYS = [
  "#",
  "S-",
  "T-",
  "K-",
  "P-",
  "W-",
  "H-",
  "R-",
  "A-",
  "O-",
  "*",
  "-E",
  "-U",
  "-F",
  "-R",
  "-P",
  "-B",
  "-L",
  "-G",
  "-T",
  "-S",
  "-D",
  "-Z",
] as const;

export type StenoKey = (typeof STENO_KEYS)[number];
export type Stroke = number;

const KEY_BIT = new Map<StenoKey, number>(
  STENO_KEYS.map((key, i) => [key, 1 << i]),
);

const NUMBER_BIT = 1;
const FIRST_MIDDLE_INDEX = 8; // A-
const FIRST_RIGHT_INDEX = 13; // -F
const MIDDLE_MASK = 0b11111 << FIRST_MIDDLE_INDEX;
const RIGHT_MASK = ~((1 << FIRST_RIGHT_INDEX) - 1);

// number bar turns these keys into digits
const NUMBER_KEYS: Partial<Record<StenoKey, string>> = {
  "S-": "1",
  "T-": "2",
  "P-": "3",
  "H-": "4",
  "A-": "5",
  "O-": "0",
  "-F": "6",
  "-P": "7",
  "-L": "8",
  "-T": "9",
};

// Plover's default QWERTY mapping, by physical key
const CODE_TO_KEY: Record<string, StenoKey> = {
  Digit1: "#",
  Digit2: "#",
  Digit3: "#",
  Digit4: "#",
  Digit5: "#",
  Digit6: "#",
  Digit7: "#",
  Digit8: "#",
  Digit9: "#",
  Digit0: "#",
  Minus: "#",
  Equal: "#",
  KeyQ: "S-",
  KeyA: "S-",
  KeyW: "T-",
  KeyS: "K-",
  KeyE: "P-",
  KeyD: "W-",
  KeyR: "H-",
  KeyF: "R-",
  KeyC: "A-",
  KeyV: "O-",
  KeyT: "*",
  KeyG: "*",
  KeyY: "*",
  KeyH: "*",
  KeyN: "-E",
  KeyM: "-U",
  KeyU: "-F",
  KeyJ: "-R",
  KeyI: "-P",
  KeyK: "-B",
  KeyO: "-L",
  KeyL: "-G",
  KeyP: "-T",
  Semicolon: "-S",
  BracketLeft: "-D",
  Quote: "-Z",
};

// keys that sit on the steno area but have no steno meaning; swallowed so they
// don't leak characters into the test
const DEAD_CODES = new Set(["KeyZ", "KeyX", "KeyB", "BracketRight"]);

export function codeToStenoKey(code: string): StenoKey | undefined {
  return CODE_TO_KEY[code];
}

export function isDeadCode(code: string): boolean {
  return DEAD_CODES.has(code);
}

export function keyBit(key: StenoKey): Stroke {
  return KEY_BIT.get(key) as number;
}

export function strokeFromKeys(keys: Iterable<StenoKey>): Stroke {
  let stroke = 0;
  for (const key of keys) stroke |= keyBit(key);
  return stroke;
}

export function strokeKeys(stroke: Stroke): StenoKey[] {
  return STENO_KEYS.filter((_, i) => (stroke & (1 << i)) !== 0);
}

export function strokeHasKey(stroke: Stroke, key: StenoKey): boolean {
  return (stroke & keyBit(key)) !== 0;
}

/** Stroke to dictionary notation, e.g. `KAT`, `-T`, `TP-PL`, `12-9`. */
export function strokeToString(stroke: Stroke): string {
  const hasNumberBar = (stroke & NUMBER_BIT) !== 0;
  const needsHyphen =
    (stroke & MIDDLE_MASK) === 0 && (stroke & RIGHT_MASK) !== 0;

  let out = "";
  let usedDigit = false;
  let hyphenated = false;
  STENO_KEYS.forEach((key, i) => {
    if (i === 0 || (stroke & (1 << i)) === 0) return;
    if (needsHyphen && !hyphenated && i >= FIRST_RIGHT_INDEX) {
      out += "-";
      hyphenated = true;
    }
    const digit = hasNumberBar ? NUMBER_KEYS[key] : undefined;
    if (digit !== undefined) {
      usedDigit = true;
      out += digit;
    } else {
      out += key.replace("-", "");
    }
  });

  if (hasNumberBar && !usedDigit) out = `#${out}`;
  return out;
}

const DIGIT_TO_KEY = new Map<string, StenoKey>(
  Object.entries(NUMBER_KEYS).map(([key, digit]) => [digit, key as StenoKey]),
);

/** Dictionary notation to stroke. Returns undefined when it isn't valid steno. */
export function parseStroke(text: string): Stroke | undefined {
  let stroke = 0;
  let index = 1; // next allowed position in steno order
  let right = false;

  for (const char of text) {
    if (char === "#") {
      stroke |= NUMBER_BIT;
      continue;
    }
    if (char === "-") {
      if (right) return undefined;
      right = true;
      index = Math.max(index, FIRST_RIGHT_INDEX);
      continue;
    }

    let letter = char;
    const digitKey = DIGIT_TO_KEY.get(char);
    if (digitKey !== undefined) {
      stroke |= NUMBER_BIT;
      letter = digitKey.replace("-", "");
    }

    let found = -1;
    for (let i = index; i < STENO_KEYS.length; i++) {
      if ((STENO_KEYS[i] as string).replace("-", "") === letter) {
        found = i;
        break;
      }
    }
    if (found === -1) return undefined;
    stroke |= 1 << found;
    index = found + 1;
  }

  return stroke === 0 ? undefined : stroke;
}

export const UNDO_STROKE = keyBit("*");
