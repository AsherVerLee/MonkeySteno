import { Config } from "../config/store";
import { onBeforeDelete } from "../input/handlers/before-delete";
import { onDelete } from "../input/handlers/delete";
import { emulateInsertText } from "../input/handlers/insert-text";
import { getInputElement, getInputElementValue } from "../input/input-element";
import { showErrorNotification } from "../states/notifications";
import { getActiveWordIndex, isTestActive } from "../states/test";
import * as TestWords from "../test/test-words";
import { loadDictionary, LoadedDictionary } from "./dictionary";
import {
  resetCoachState,
  setCoachState,
  setLastStroke,
  setPressedKeys,
} from "./state";
import { ChordBuilder } from "./chord";
import { isDeadCode, Stroke, UNDO_STROKE } from "./stroke";
import { Translator } from "./translator";

const chord = new ChordBuilder();

let translator: Translator | undefined;
// strokes made so far towards the word being written, for coach mode
let wordStrokes: Stroke[] = [];
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

  if (!chord.down(event.code)) {
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
  setPressedKeys(chord.current());
  return true;
}

export function handleKeyup(event: KeyboardEvent): boolean {
  const { handled, stroke } = chord.up(event.code);
  if (!handled) return false;

  if (stroke !== undefined) {
    setPressedKeys(0);
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
  chord.cancel();
  setPressedKeys(0);
}

async function applyStroke(stroke: Stroke): Promise<void> {
  const dictionary = await loadDictionary();
  translator ??= new Translator(dictionary);

  // nothing typed yet means a fresh test
  if (!isTestActive()) {
    translator.reset();
    wordStrokes = [];
    resetCoachState();
  }

  setLastStroke(stroke);
  const now = performance.now();

  // the asterisk starts the word over: one clean slate is easier to recover
  // from than undoing stroke by stroke once the output has drifted
  if (stroke === UNDO_STROKE) {
    clearWord(now);
    translator.reset();
    wordStrokes = [];
    resetCoachState();
    return;
  }

  // with spaces before words, a finished word is still the active one, so
  // this stroke belongs to the word after it
  const coach = Config.stenoCoach && Config.mode !== "zen";
  const inputBefore = getInputElementValue().inputValue;
  const startsNextWord =
    inputBefore !== "" && inputBefore === TestWords.words.getCurrent()?.text;
  const targetIndex = getActiveWordIndex() + (startsNextWord ? 1 : 0);
  if (startsNextWord || inputBefore === "") wordStrokes = [];

  // picking up after a reset mid-test, the word on screen still needs its
  // space before the next one
  if (translator.isFresh() && getInputElementValue().inputValue !== "") {
    await emulateInsertText({ data: " ", now });
  }

  const { backspaces, text } = translator.stroke(stroke);

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

  if (coach && isTestActive()) {
    coachStroke(dictionary, stroke, targetIndex, now);
  }
}

// teaching mode: a stroke that can't lead to the word wipes it straight away,
// so the learner retries the chord instead of drifting out of step
function coachStroke(
  dictionary: LoadedDictionary,
  stroke: Stroke,
  targetIndex: number,
  now: number,
): void {
  const word = TestWords.words.get(targetIndex)?.text;
  const activeIndex = getActiveWordIndex();
  // a phrase brief ran past the word, nothing sensible to compare against
  if (word === undefined || activeIndex > targetIndex) {
    wordStrokes = [];
    resetCoachState();
    return;
  }

  wordStrokes.push(stroke);
  const input = getInputElementValue().inputValue;

  if (activeIndex === targetIndex && isOnTrack(dictionary, word, input)) {
    const finished = input === word;
    if (finished) wordStrokes = [];
    setCoachState({ strokeIndex: wordStrokes.length, wrong: undefined });
    return;
  }

  if (input !== "") clearWord(now);
  translator?.reset();
  wordStrokes = [];
  setCoachState({ strokeIndex: 0, wrong: stroke });
}

function isOnTrack(
  dictionary: LoadedDictionary,
  word: string,
  input: string,
): boolean {
  if (input === word) return true;

  const { strokes: outlines, exact } = dictionary.outlines(word);
  const followsOutline = outlines.some((outline) =>
    wordStrokes.every((stroke, i) => outline[i] === stroke),
  );
  if (followsOutline) return true;

  // punctuation, capitals and words outside the dictionary take strokes no
  // outline lists, there the text so far is all there is to go on
  return !exact && word.startsWith(input);
}

// empties the word being typed, or the previous one when nothing is typed yet
function clearWord(now: number): void {
  if (getInputElementValue().inputValue === "" && !emulateDelete(now)) return;
  while (getInputElementValue().inputValue !== "") {
    if (!emulateDelete(now)) return;
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
