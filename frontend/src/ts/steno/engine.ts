import { Config } from "../config/store";
import { onBeforeDelete } from "../input/handlers/before-delete";
import { onDelete } from "../input/handlers/delete";
import { emulateInsertText } from "../input/handlers/insert-text";
import { getInputElement } from "../input/input-element";
import { showErrorNotification } from "../states/notifications";
import { isTestActive } from "../states/test";
import { loadDictionary } from "./dictionary";
import { setLastStroke } from "./state";
import { codeToStenoKey, isDeadCode, keyBit, Stroke } from "./stroke";
import { Translator } from "./translator";

// physical keys currently held, and the chord they have built up so far
const held = new Set<string>();
let chord: Stroke = 0;

let translator: Translator | undefined;
let queue: Promise<void> = Promise.resolve();

function isChordMode(): boolean {
  return Config.stenoMode === "chord";
}

function hasModifier(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey;
}

/** @returns true when the key belongs to a chord and must not type anything */
export function handleKeydown(event: KeyboardEvent): boolean {
  if (!isChordMode() || hasModifier(event)) return false;

  const key = codeToStenoKey(event.code);
  if (key === undefined) {
    if (isDeadCode(event.code)) {
      event.preventDefault();
      return true;
    }
    // anything typed around the engine (space, backspace) makes its idea of
    // the output stale
    if (!event.repeat) translator?.reset();
    return false;
  }

  event.preventDefault();
  held.add(event.code);
  chord |= keyBit(key);
  return true;
}

export function handleKeyup(event: KeyboardEvent): boolean {
  if (!held.delete(event.code)) return false;

  if (held.size === 0 && chord !== 0) {
    const stroke = chord;
    chord = 0;
    queue = queue
      .then(async () => applyStroke(stroke))
      .catch((error: unknown) => {
        console.error(error);
        showErrorNotification("Steno engine failed to process stroke");
      });
  }
  return true;
}

/** Drop a half-built chord, e.g. when the input loses focus mid-stroke. */
export function cancelChord(): void {
  held.clear();
  chord = 0;
}

async function applyStroke(stroke: Stroke): Promise<void> {
  const dictionary = await loadDictionary();
  translator ??= new Translator(dictionary);

  // nothing typed yet means a fresh test
  if (!isTestActive()) translator.reset();

  setLastStroke(stroke);
  const { backspaces, text } = translator.stroke(stroke);
  const now = performance.now();

  for (let i = 0; i < backspaces; i++) {
    if (!emulateDelete(now)) break;
  }
  for (let i = 0; i < text.length; i++) {
    await emulateInsertText({
      data: text[i] as string,
      now,
      lastInMultiIndex: i === text.length - 1,
    });
  }
}

function emulateDelete(now: number): boolean {
  let prevented = false;
  onBeforeDelete({
    preventDefault: () => {
      prevented = true;
    },
  } as InputEvent);
  if (prevented) return false;

  // default is prevented so we need to manually update the input value.
  const input = getInputElement();
  input.value = input.value.slice(0, -1);
  onDelete("deleteContentBackward", now);
  return true;
}
